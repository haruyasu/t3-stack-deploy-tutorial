import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const postPerPage = 3
export const userPostPerPage = 3
export const commentPerPage = 3
