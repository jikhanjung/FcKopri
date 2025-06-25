'use client'

import Link from 'next/link'
import versionInfo from '@/version.json'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="mb-2 sm:mb-0">
            <span className="font-medium">FcKopri</span> v{versionInfo.version} · 
            <span className="ml-1">제1회 KOPRI CUP 리그 관리 시스템</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/login" className="hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors">
              관리자
            </Link>
            <span>·</span>
            <a 
              href="https://github.com/jikhanjung/FcKopri" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-kopri-blue dark:hover:text-kopri-lightblue transition-colors"
            >
              GitHub
            </a>
            <span>·</span>
            <span>© 2025 KOPRI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}