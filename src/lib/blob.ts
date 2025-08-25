import { put, del, list } from '@vercel/blob';
import { writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';

export async function uploadFile(file: File, path: string) {
  try {
    const blob = await put(path, file, {
      access: 'public',
    });
    return blob;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(url: string) {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function listFiles(prefix?: string) {
  try {
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}
