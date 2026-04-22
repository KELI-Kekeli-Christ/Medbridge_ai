import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export function GET() {
  const cwd = process.cwd()
  const hasTailwindJs = fs.existsSync(path.join(cwd, 'tailwind.config.js'))
  const hasTailwindTs = fs.existsSync(path.join(cwd, 'tailwind.config.ts'))
  const hasPostcss = fs.existsSync(path.join(cwd, 'postcss.config.mjs'))
  return NextResponse.json({ cwd, hasTailwindJs, hasTailwindTs, hasPostcss })
}
