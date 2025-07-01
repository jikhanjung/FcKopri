-- 사용자 권한 관리 시스템
-- 확장 가능한 역할 기반 접근 제어 (RBAC) 구현

-- 권한 타입 열거형 정의
CREATE TYPE user_role_type AS ENUM ('user', 'moderator', 'admin', 'super_admin');

-- 사용자 권한 테이블
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES public.user_profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL이면 영구 권한
    is_active BOOLEAN DEFAULT true NOT NULL,
    reason TEXT, -- 권한 부여/취소 사유
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON public.user_roles(expires_at);

-- 복합 인덱스: 활성 권한 조회용
CREATE INDEX IF NOT EXISTS idx_user_roles_active_lookup 
ON public.user_roles(user_id, is_active) 
WHERE is_active = true;

-- RLS (Row Level Security) 정책
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 권한 목록을 볼 수 있음
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- 관리자는 모든 권한을 볼 수 있음
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- 슈퍼 관리자만 권한을 부여/수정할 수 있음
CREATE POLICY "Super admins can manage roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'super_admin'
            AND ur.is_active = true
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- 사용자 권한 확인 함수
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(role user_role_type, expires_at TIMESTAMP WITH TIME ZONE) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT ur.role, ur.expires_at
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$;

-- 사용자가 특정 권한을 가지고 있는지 확인하는 함수
CREATE OR REPLACE FUNCTION public.has_role(
    user_uuid UUID DEFAULT auth.uid(),
    required_role user_role_type DEFAULT 'user'
)
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    user_roles user_role_type[];
    role_hierarchy INTEGER;
    user_max_level INTEGER := 0;
    required_level INTEGER;
BEGIN
    -- 권한 계층 정의 (숫자가 높을수록 상위 권한)
    CASE required_role
        WHEN 'user' THEN required_level := 1;
        WHEN 'moderator' THEN required_level := 2;
        WHEN 'admin' THEN required_level := 3;
        WHEN 'super_admin' THEN required_level := 4;
        ELSE required_level := 1;
    END CASE;

    -- 사용자의 활성 권한들 조회
    SELECT ARRAY_AGG(ur.role) INTO user_roles
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());

    -- 사용자가 가진 권한 중 최고 레벨 찾기
    IF user_roles IS NOT NULL THEN
        FOR i IN 1..array_length(user_roles, 1) LOOP
            CASE user_roles[i]
                WHEN 'user' THEN role_hierarchy := 1;
                WHEN 'moderator' THEN role_hierarchy := 2;
                WHEN 'admin' THEN role_hierarchy := 3;
                WHEN 'super_admin' THEN role_hierarchy := 4;
                ELSE role_hierarchy := 1;
            END CASE;
            
            IF role_hierarchy > user_max_level THEN
                user_max_level := role_hierarchy;
            END IF;
        END LOOP;
    END IF;

    RETURN user_max_level >= required_level;
END;
$$;

-- 권한 부여 함수
CREATE OR REPLACE FUNCTION public.grant_user_role(
    target_user_id UUID,
    new_role user_role_type,
    granted_by_user_id UUID DEFAULT auth.uid(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    new_role_id UUID;
    granter_is_super_admin BOOLEAN;
BEGIN
    -- 권한 부여자가 슈퍼 관리자인지 확인
    SELECT public.has_role(granted_by_user_id, 'super_admin') INTO granter_is_super_admin;
    
    IF NOT granter_is_super_admin THEN
        RAISE EXCEPTION 'Only super administrators can grant roles';
    END IF;

    -- 기존 동일 권한 비활성화
    UPDATE public.user_roles 
    SET is_active = false, 
        updated_at = NOW()
    WHERE user_id = target_user_id 
    AND role = new_role 
    AND is_active = true;

    -- 새 권한 부여
    INSERT INTO public.user_roles (user_id, role, granted_by, expires_at, reason)
    VALUES (target_user_id, new_role, granted_by_user_id, expires_at, reason)
    RETURNING id INTO new_role_id;

    RETURN new_role_id;
END;
$$;

-- 권한 취소 함수
CREATE OR REPLACE FUNCTION public.revoke_user_role(
    target_user_id UUID,
    role_to_revoke user_role_type,
    revoked_by_user_id UUID DEFAULT auth.uid(),
    reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    revoker_is_super_admin BOOLEAN;
BEGIN
    -- 권한 취소자가 슈퍼 관리자인지 확인
    SELECT public.has_role(revoked_by_user_id, 'super_admin') INTO revoker_is_super_admin;
    
    IF NOT revoker_is_super_admin THEN
        RAISE EXCEPTION 'Only super administrators can revoke roles';
    END IF;

    -- 권한 비활성화
    UPDATE public.user_roles 
    SET is_active = false,
        reason = COALESCE(reason, 'Revoked by administrator'),
        updated_at = NOW()
    WHERE user_id = target_user_id 
    AND role = role_to_revoke 
    AND is_active = true;

    RETURN FOUND;
END;
$$;

-- 초기 슈퍼 관리자 설정을 위한 함수 (최초 설정용)
CREATE OR REPLACE FUNCTION public.initialize_super_admin(
    user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    existing_super_admin_count INTEGER;
BEGIN
    -- 기존 슈퍼 관리자가 있는지 확인
    SELECT COUNT(*) INTO existing_super_admin_count
    FROM public.user_roles ur
    WHERE ur.role = 'super_admin'
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());

    -- 이미 슈퍼 관리자가 있으면 실행 불가
    IF existing_super_admin_count > 0 THEN
        RAISE EXCEPTION 'Super administrator already exists. Use grant_user_role function instead.';
    END IF;

    -- 사용자 찾기
    SELECT up.id INTO target_user_id
    FROM public.user_profiles up
    WHERE up.email = user_email
    AND up.is_active = true;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- 슈퍼 관리자 권한 부여
    INSERT INTO public.user_roles (user_id, role, granted_by, reason)
    VALUES (target_user_id, 'super_admin', target_user_id, 'Initial super administrator setup');

    RETURN TRUE;
END;
$$;

-- 댓글: 
-- 1. 이 시스템은 계층적 권한 구조를 지원합니다.
-- 2. super_admin > admin > moderator > user 순으로 권한이 높습니다.
-- 3. 상위 권한자는 하위 권한이 필요한 모든 작업을 수행할 수 있습니다.
-- 4. 권한에는 만료일을 설정할 수 있어 임시 권한 부여가 가능합니다.
-- 5. 모든 권한 변경 이력이 기록됩니다.