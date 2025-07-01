

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."best6_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "voter_ip" character varying(45) NOT NULL,
    "voted_player_id" "uuid" NOT NULL,
    "position_type" character varying(20) NOT NULL,
    "position_slot" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "competition_id" "uuid",
    CONSTRAINT "best6_votes_check" CHECK ((((("position_type")::"text" = 'forward'::"text") AND ("position_slot" = 1)) OR ((("position_type")::"text" = 'midfielder'::"text") AND ("position_slot" = ANY (ARRAY[1, 2]))) OR ((("position_type")::"text" = 'defender'::"text") AND ("position_slot" = ANY (ARRAY[1, 2]))) OR ((("position_type")::"text" = 'goalkeeper'::"text") AND ("position_slot" = 1)))),
    CONSTRAINT "best6_votes_position_type_check" CHECK ((("position_type")::"text" = ANY ((ARRAY['forward'::character varying, 'midfielder'::character varying, 'defender'::character varying, 'goalkeeper'::character varying])::"text"[])))
);


ALTER TABLE "public"."best6_votes" OWNER TO "postgres";


COMMENT ON TABLE "public"."best6_votes" IS 'Stores votes for Best 6 players by position - 1 forward, 2
  midfielders, 2 defenders, 1 goalkeeper';



CREATE TABLE IF NOT EXISTS "public"."champion_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_name" "text" NOT NULL,
    "user_email" "text",
    "voted_team_id" "uuid" NOT NULL,
    "confidence_level" integer NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "champion_votes_confidence_level_check" CHECK ((("confidence_level" >= 1) AND ("confidence_level" <= 5)))
);


ALTER TABLE "public"."champion_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "user_ip" character varying(45) NOT NULL,
    "reaction_type" character varying(10) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "comment_reactions_reaction_type_check" CHECK ((("reaction_type")::"text" = ANY ((ARRAY['like'::character varying, 'dislike'::character varying])::"text"[])))
);


ALTER TABLE "public"."comment_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid",
    "match_photo_id" "uuid",
    "team_photo_id" "uuid",
    "team_id" "uuid",
    "author_name" character varying(50) NOT NULL,
    "author_ip" character varying(45) NOT NULL,
    "content" "text" NOT NULL,
    "is_admin" boolean DEFAULT false,
    "parent_comment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "comments_check" CHECK (((("match_id" IS NOT NULL) AND ("match_photo_id" IS NULL) AND ("team_photo_id" IS NULL) AND ("team_id" IS NULL)) OR (("match_id" IS NULL) AND ("match_photo_id" IS NOT NULL) AND ("team_photo_id" IS NULL) AND ("team_id" IS NULL)) OR (("match_id" IS NULL) AND ("match_photo_id" IS NULL) AND ("team_photo_id" IS NOT NULL) AND ("team_id" IS NULL)) OR (("match_id" IS NULL) AND ("match_photo_id" IS NULL) AND ("team_photo_id" IS NULL) AND ("team_id" IS NOT NULL))))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."competitions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "year" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "description" "text",
    "start_date" "date",
    "end_date" "date",
    "half_duration_minutes" integer DEFAULT 45
);


ALTER TABLE "public"."competitions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."competitions"."half_duration_minutes" IS 'Duration of each half in minutes (both halves have same duration)';



CREATE TABLE IF NOT EXISTS "public"."match_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "assist_player_id" "uuid",
    "team_id" "uuid" NOT NULL,
    "minute" integer NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "half" character varying(10) DEFAULT 'first'::character varying,
    CONSTRAINT "match_events_minute_check" CHECK (("minute" >= 0)),
    CONSTRAINT "match_events_type_check" CHECK (("type" = ANY (ARRAY['goal'::"text", 'assist'::"text", 'substitution'::"text", 'card'::"text"])))
);


ALTER TABLE "public"."match_events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."match_events"."half" IS 'Match half: first or second';



CREATE TABLE IF NOT EXISTS "public"."match_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "filename" "text" NOT NULL,
    "caption" "text",
    "file_path" "text" NOT NULL,
    "file_size" integer,
    "mime_type" "text",
    "uploaded_by" "text" DEFAULT 'admin'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."match_photos" OWNER TO "postgres";


COMMENT ON TABLE "public"."match_photos" IS '경기별 사진 업로드 관리 테이블';



COMMENT ON COLUMN "public"."match_photos"."match_id" IS '경기 ID (외래키)';



COMMENT ON COLUMN "public"."match_photos"."filename" IS '원본 파일명';



COMMENT ON COLUMN "public"."match_photos"."caption" IS '사진 설명/캡션';



COMMENT ON COLUMN "public"."match_photos"."file_path" IS 'Supabase Storage 파일 경로';



COMMENT ON COLUMN "public"."match_photos"."file_size" IS '파일 크기 (바이트)';



COMMENT ON COLUMN "public"."match_photos"."mime_type" IS '파일 MIME 타입';



COMMENT ON COLUMN "public"."match_photos"."uploaded_by" IS '업로드한 사용자';



COMMENT ON COLUMN "public"."match_photos"."created_at" IS '업로드 시간';



CREATE TABLE IF NOT EXISTS "public"."match_predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL,
    "user_email" "text",
    "predicted_home_score" integer NOT NULL,
    "predicted_away_score" integer NOT NULL,
    "confidence_level" integer NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "match_predictions_confidence_level_check" CHECK ((("confidence_level" >= 1) AND ("confidence_level" <= 5))),
    CONSTRAINT "match_predictions_predicted_away_score_check" CHECK (("predicted_away_score" >= 0)),
    CONSTRAINT "match_predictions_predicted_home_score_check" CHECK (("predicted_home_score" >= 0))
);


ALTER TABLE "public"."match_predictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_videos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "video_type" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "youtube_url" "text" NOT NULL,
    "youtube_video_id" character varying(20),
    "thumbnail_url" "text",
    "duration" character varying(20),
    "description" "text",
    "display_order" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "uploaded_by" "text" DEFAULT 'admin'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "check_youtube_url" CHECK (("youtube_url" ~ '^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+(&.*)?$'::"text")),
    CONSTRAINT "match_videos_video_type_check" CHECK ((("video_type")::"text" = ANY ((ARRAY['highlight'::character varying, 'goals'::character varying, 'full_match'::character varying, 'interview'::character varying, 'analysis'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."match_videos" OWNER TO "postgres";


COMMENT ON TABLE "public"."match_videos" IS '경기별 다중 영상 관리 테이블 - 하이라이트, 골 장면, 전체 경기 등 다양한 영>상 타입 지원';



COMMENT ON COLUMN "public"."match_videos"."match_id" IS '경기 ID (외래키)';



COMMENT ON COLUMN "public"."match_videos"."video_type" IS '영상 타입 (highlight: 하이라이트, goals: 골 장면, full_match: >전체 경기, interview: 인터뷰, analysis: 분석, other: 기타)';



COMMENT ON COLUMN "public"."match_videos"."title" IS '영상 제목';



COMMENT ON COLUMN "public"."match_videos"."youtube_url" IS '유튜브 영상 URL';



COMMENT ON COLUMN "public"."match_videos"."youtube_video_id" IS '유튜브 비디오 ID (자동 추출)';



COMMENT ON COLUMN "public"."match_videos"."thumbnail_url" IS '썸네일 이미지 URL';



COMMENT ON COLUMN "public"."match_videos"."duration" IS '영상 길이 (예: 3:45)';



COMMENT ON COLUMN "public"."match_videos"."description" IS '영상 설명';



COMMENT ON COLUMN "public"."match_videos"."display_order" IS '표시 순서 (숫자가 작을수록 먼저 표시)';



COMMENT ON COLUMN "public"."match_videos"."is_featured" IS '대표 영상 여부 (경기 카드에 표시될 메인 영상)';



COMMENT ON COLUMN "public"."match_videos"."uploaded_by" IS '업로드한 사용자';



COMMENT ON COLUMN "public"."match_videos"."created_at" IS '등록 시간';



COMMENT ON COLUMN "public"."match_videos"."updated_at" IS '수정 시간';



CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "competition_id" "uuid",
    "home_team_id" "uuid",
    "away_team_id" "uuid",
    "match_date" timestamp with time zone NOT NULL,
    "status" character varying(50) DEFAULT 'scheduled'::character varying,
    "home_score" integer DEFAULT 0,
    "away_score" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "man_of_the_match_id" "uuid",
    "youtube_url" "text",
    "youtube_title" character varying(255),
    "youtube_thumbnail_url" "text",
    "youtube_duration" character varying(20),
    CONSTRAINT "check_youtube_url" CHECK ((("youtube_url" IS NULL) OR ("youtube_url" ~ '^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+(&.*)?$'::"text")))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


COMMENT ON COLUMN "public"."matches"."man_of_the_match_id" IS 'Man of the Match로 선정된 선수 ID (관리자가 선정)';



CREATE TABLE IF NOT EXISTS "public"."mvp_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "voter_ip" character varying(45) NOT NULL,
    "voted_player_id" "uuid" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."mvp_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "team_id" "uuid",
    "position" character varying(50),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "department" "text",
    "jersey_number" integer
);


ALTER TABLE "public"."players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."playoff_matches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "competition_id" "uuid",
    "round" character varying(50) NOT NULL,
    "match_number" integer NOT NULL,
    "home_team_id" "uuid",
    "away_team_id" "uuid",
    "match_date" timestamp with time zone,
    "status" character varying(50) DEFAULT 'scheduled'::character varying,
    "home_score" integer DEFAULT 0,
    "away_score" integer DEFAULT 0,
    "winner_team_id" "uuid",
    "next_match_id" "uuid",
    "is_home_team" boolean,
    "man_of_the_match_id" "uuid",
    "youtube_url" character varying(500),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."playoff_matches" OWNER TO "postgres";


COMMENT ON TABLE "public"."playoff_matches" IS 'Stores playoff/tournament matches for knockout stage games';



CREATE TABLE IF NOT EXISTS "public"."team_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "filename" "text" NOT NULL,
    "caption" "text",
    "file_path" "text" NOT NULL,
    "file_size" integer,
    "mime_type" "text",
    "photo_type" "text" DEFAULT 'general'::"text",
    "uploaded_by" "text" DEFAULT 'admin'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "team_photos_photo_type_check" CHECK (("photo_type" = ANY (ARRAY['logo'::"text", 'team'::"text", 'training'::"text", 'general'::"text"])))
);


ALTER TABLE "public"."team_photos" OWNER TO "postgres";


COMMENT ON TABLE "public"."team_photos" IS '팀별 사진 업로드 관리 테이블';



COMMENT ON COLUMN "public"."team_photos"."team_id" IS '팀 ID (외래키)';



COMMENT ON COLUMN "public"."team_photos"."filename" IS '원본 파일명';



COMMENT ON COLUMN "public"."team_photos"."caption" IS '사진 설명/캡션';



COMMENT ON COLUMN "public"."team_photos"."file_path" IS 'Supabase Storage 파일 경로';



COMMENT ON COLUMN "public"."team_photos"."file_size" IS '파일 크기 (바이트)';



COMMENT ON COLUMN "public"."team_photos"."mime_type" IS '파일 MIME 타입';



COMMENT ON COLUMN "public"."team_photos"."photo_type" IS '사진 유형 (logo: 팀 로고, team: 팀 단체사진, training: 훈련사진, general: 일반사진)';



COMMENT ON COLUMN "public"."team_photos"."uploaded_by" IS '업로드한 사용자';



COMMENT ON COLUMN "public"."team_photos"."created_at" IS '업로드 시간';



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "department" character varying(255),
    "competition_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "logo_url" "text",
    "is_hidden" boolean DEFAULT false
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


ALTER TABLE ONLY "public"."best6_votes"
    ADD CONSTRAINT "best6_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."best6_votes"
    ADD CONSTRAINT "best6_votes_voter_ip_position_type_position_slot_key" UNIQUE ("voter_ip", "position_type", "position_slot");



ALTER TABLE ONLY "public"."champion_votes"
    ADD CONSTRAINT "champion_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."champion_votes"
    ADD CONSTRAINT "champion_votes_user_email_key" UNIQUE ("user_email");



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_comment_id_user_ip_key" UNIQUE ("comment_id", "user_ip");



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."competitions"
    ADD CONSTRAINT "competitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_events"
    ADD CONSTRAINT "match_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_photos"
    ADD CONSTRAINT "match_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_predictions"
    ADD CONSTRAINT "match_predictions_match_id_user_email_key" UNIQUE ("match_id", "user_email");



ALTER TABLE ONLY "public"."match_predictions"
    ADD CONSTRAINT "match_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_videos"
    ADD CONSTRAINT "match_videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mvp_votes"
    ADD CONSTRAINT "mvp_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mvp_votes"
    ADD CONSTRAINT "mvp_votes_voter_ip_key" UNIQUE ("voter_ip");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_photos"
    ADD CONSTRAINT "team_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_best6_votes_competition_id" ON "public"."best6_votes" USING "btree" ("competition_id");



CREATE INDEX "idx_best6_votes_created_at" ON "public"."best6_votes" USING "btree" ("created_at");



CREATE INDEX "idx_best6_votes_player_id" ON "public"."best6_votes" USING "btree" ("voted_player_id");



CREATE INDEX "idx_best6_votes_position_slot" ON "public"."best6_votes" USING "btree" ("position_slot");



CREATE INDEX "idx_best6_votes_position_type" ON "public"."best6_votes" USING "btree" ("position_type");



CREATE INDEX "idx_best6_votes_voted_player_id" ON "public"."best6_votes" USING "btree" ("voted_player_id");



CREATE INDEX "idx_champion_votes_created_at" ON "public"."champion_votes" USING "btree" ("created_at");



CREATE INDEX "idx_champion_votes_team_id" ON "public"."champion_votes" USING "btree" ("voted_team_id");



CREATE INDEX "idx_champion_votes_user_email" ON "public"."champion_votes" USING "btree" ("user_email");



CREATE INDEX "idx_comment_reactions_comment_id" ON "public"."comment_reactions" USING "btree" ("comment_id");



CREATE INDEX "idx_comments_created_at" ON "public"."comments" USING "btree" ("created_at");



CREATE INDEX "idx_comments_match_id" ON "public"."comments" USING "btree" ("match_id");



CREATE INDEX "idx_comments_match_photo_id" ON "public"."comments" USING "btree" ("match_photo_id");



CREATE INDEX "idx_comments_parent_id" ON "public"."comments" USING "btree" ("parent_comment_id");



CREATE INDEX "idx_comments_team_id" ON "public"."comments" USING "btree" ("team_id");



CREATE INDEX "idx_comments_team_photo_id" ON "public"."comments" USING "btree" ("team_photo_id");



CREATE INDEX "idx_match_events_half" ON "public"."match_events" USING "btree" ("half");



CREATE INDEX "idx_match_events_match_id" ON "public"."match_events" USING "btree" ("match_id");



CREATE INDEX "idx_match_events_minute" ON "public"."match_events" USING "btree" ("minute");



CREATE INDEX "idx_match_events_player_id" ON "public"."match_events" USING "btree" ("player_id");



CREATE INDEX "idx_match_events_team_id" ON "public"."match_events" USING "btree" ("team_id");



CREATE INDEX "idx_match_events_type" ON "public"."match_events" USING "btree" ("type");



CREATE INDEX "idx_match_photos_created_at" ON "public"."match_photos" USING "btree" ("created_at");



CREATE INDEX "idx_match_photos_match_id" ON "public"."match_photos" USING "btree" ("match_id");



CREATE INDEX "idx_match_predictions_created_at" ON "public"."match_predictions" USING "btree" ("created_at");



CREATE INDEX "idx_match_predictions_match_id" ON "public"."match_predictions" USING "btree" ("match_id");



CREATE INDEX "idx_match_predictions_user_email" ON "public"."match_predictions" USING "btree" ("user_email");



CREATE INDEX "idx_match_videos_created_at" ON "public"."match_videos" USING "btree" ("created_at");



CREATE INDEX "idx_match_videos_featured" ON "public"."match_videos" USING "btree" ("is_featured");



CREATE INDEX "idx_match_videos_match_id" ON "public"."match_videos" USING "btree" ("match_id");



CREATE INDEX "idx_match_videos_order" ON "public"."match_videos" USING "btree" ("display_order");



CREATE INDEX "idx_match_videos_type" ON "public"."match_videos" USING "btree" ("video_type");



CREATE INDEX "idx_matches_away_team_id" ON "public"."matches" USING "btree" ("away_team_id");



CREATE INDEX "idx_matches_competition_id" ON "public"."matches" USING "btree" ("competition_id");



CREATE INDEX "idx_matches_home_team_id" ON "public"."matches" USING "btree" ("home_team_id");



CREATE INDEX "idx_matches_man_of_the_match_id" ON "public"."matches" USING "btree" ("man_of_the_match_id");



CREATE INDEX "idx_matches_youtube_url" ON "public"."matches" USING "btree" ("youtube_url");



CREATE INDEX "idx_mvp_votes_created_at" ON "public"."mvp_votes" USING "btree" ("created_at");



CREATE INDEX "idx_mvp_votes_player_id" ON "public"."mvp_votes" USING "btree" ("voted_player_id");



CREATE INDEX "idx_players_team_id" ON "public"."players" USING "btree" ("team_id");



CREATE INDEX "idx_playoff_matches_away_team_id" ON "public"."playoff_matches" USING "btree" ("away_team_id");



CREATE INDEX "idx_playoff_matches_competition_id" ON "public"."playoff_matches" USING "btree" ("competition_id");



CREATE INDEX "idx_playoff_matches_home_team_id" ON "public"."playoff_matches" USING "btree" ("home_team_id");



CREATE INDEX "idx_playoff_matches_round" ON "public"."playoff_matches" USING "btree" ("round");



CREATE INDEX "idx_playoff_matches_winner" ON "public"."playoff_matches" USING "btree" ("winner_team_id");



CREATE INDEX "idx_team_photos_created_at" ON "public"."team_photos" USING "btree" ("created_at");



CREATE INDEX "idx_team_photos_photo_type" ON "public"."team_photos" USING "btree" ("photo_type");



CREATE INDEX "idx_team_photos_team_id" ON "public"."team_photos" USING "btree" ("team_id");



CREATE INDEX "idx_teams_competition_id" ON "public"."teams" USING "btree" ("competition_id");



CREATE INDEX "idx_teams_is_hidden" ON "public"."teams" USING "btree" ("is_hidden");



CREATE OR REPLACE TRIGGER "update_champion_votes_updated_at" BEFORE UPDATE ON "public"."champion_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_competitions_updated_at" BEFORE UPDATE ON "public"."competitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_match_predictions_updated_at" BEFORE UPDATE ON "public"."match_predictions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_match_videos_updated_at" BEFORE UPDATE ON "public"."match_videos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_matches_updated_at" BEFORE UPDATE ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_players_updated_at" BEFORE UPDATE ON "public"."players" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_playoff_matches_updated_at" BEFORE UPDATE ON "public"."playoff_matches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."best6_votes"
    ADD CONSTRAINT "best6_votes_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."best6_votes"
    ADD CONSTRAINT "best6_votes_voted_player_id_fkey" FOREIGN KEY ("voted_player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."champion_votes"
    ADD CONSTRAINT "champion_votes_voted_team_id_fkey" FOREIGN KEY ("voted_team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_match_photo_id_fkey" FOREIGN KEY ("match_photo_id") REFERENCES "public"."match_photos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_team_photo_id_fkey" FOREIGN KEY ("team_photo_id") REFERENCES "public"."team_photos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_events"
    ADD CONSTRAINT "match_events_assist_player_id_fkey" FOREIGN KEY ("assist_player_id") REFERENCES "public"."players"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."match_events"
    ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_events"
    ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_events"
    ADD CONSTRAINT "match_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_photos"
    ADD CONSTRAINT "match_photos_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_predictions"
    ADD CONSTRAINT "match_predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_videos"
    ADD CONSTRAINT "match_videos_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_man_of_the_match_id_fkey" FOREIGN KEY ("man_of_the_match_id") REFERENCES "public"."players"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mvp_votes"
    ADD CONSTRAINT "mvp_votes_voted_player_id_fkey" FOREIGN KEY ("voted_player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_man_of_the_match_id_fkey" FOREIGN KEY ("man_of_the_match_id") REFERENCES "public"."players"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_next_match_id_fkey" FOREIGN KEY ("next_match_id") REFERENCES "public"."playoff_matches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."playoff_matches"
    ADD CONSTRAINT "playoff_matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."team_photos"
    ADD CONSTRAINT "team_photos_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete match events" ON "public"."match_events" FOR DELETE USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can delete predictions" ON "public"."match_predictions" FOR DELETE USING (true);



CREATE POLICY "Admins can delete votes" ON "public"."champion_votes" FOR DELETE USING (true);



CREATE POLICY "Admins can insert match events" ON "public"."match_events" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can update match events" ON "public"."match_events" FOR UPDATE USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin delete access" ON "public"."match_photos" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@kopri.re.kr'::"text"));



CREATE POLICY "Allow admin insert access" ON "public"."match_photos" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'admin@kopri.re.kr'::"text"));



CREATE POLICY "Allow admin update access" ON "public"."match_photos" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@kopri.re.kr'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'admin@kopri.re.kr'::"text"));



CREATE POLICY "Allow read access for all users" ON "public"."match_photos" FOR SELECT USING (true);



CREATE POLICY "Anyone can insert champion votes" ON "public"."champion_votes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can insert predictions" ON "public"."match_predictions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view champion votes" ON "public"."champion_votes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view match events" ON "public"."match_events" FOR SELECT USING (true);



CREATE POLICY "Anyone can view predictions" ON "public"."match_predictions" FOR SELECT USING (true);



CREATE POLICY "Users can update their own predictions" ON "public"."match_predictions" FOR UPDATE USING (true);



CREATE POLICY "Users can update their own votes" ON "public"."champion_votes" FOR UPDATE USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."best6_votes" TO "anon";
GRANT ALL ON TABLE "public"."best6_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."best6_votes" TO "service_role";



GRANT ALL ON TABLE "public"."champion_votes" TO "anon";
GRANT ALL ON TABLE "public"."champion_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."champion_votes" TO "service_role";



GRANT ALL ON TABLE "public"."comment_reactions" TO "anon";
GRANT ALL ON TABLE "public"."comment_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."competitions" TO "anon";
GRANT ALL ON TABLE "public"."competitions" TO "authenticated";
GRANT ALL ON TABLE "public"."competitions" TO "service_role";



GRANT ALL ON TABLE "public"."match_events" TO "anon";
GRANT ALL ON TABLE "public"."match_events" TO "authenticated";
GRANT ALL ON TABLE "public"."match_events" TO "service_role";



GRANT ALL ON TABLE "public"."match_photos" TO "anon";
GRANT ALL ON TABLE "public"."match_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."match_photos" TO "service_role";



GRANT ALL ON TABLE "public"."match_predictions" TO "anon";
GRANT ALL ON TABLE "public"."match_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."match_predictions" TO "service_role";



GRANT ALL ON TABLE "public"."match_videos" TO "anon";
GRANT ALL ON TABLE "public"."match_videos" TO "authenticated";
GRANT ALL ON TABLE "public"."match_videos" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."mvp_votes" TO "anon";
GRANT ALL ON TABLE "public"."mvp_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."mvp_votes" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."playoff_matches" TO "anon";
GRANT ALL ON TABLE "public"."playoff_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."playoff_matches" TO "service_role";



GRANT ALL ON TABLE "public"."team_photos" TO "anon";
GRANT ALL ON TABLE "public"."team_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."team_photos" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
