export type AESMode = 'CBC' | 'CFB' | 'CTR' | 'ECB' | 'GCM' | 'OFB'
export type AESKeyLength = 128 | 192 | 256

export const AES_MODES: AESMode[] = ['CBC', 'CFB', 'CTR', 'ECB', 'GCM', 'OFB']
export const AES_KEY_LENGTHS: AESKeyLength[] = [128, 192, 256]

export const DEFAULT_AES_MODE: AESMode = 'CBC'
export const DEFAULT_AES_KEY_LENGTH: AESKeyLength = 256

export interface AESOptions {
  mode: AESMode
  keyLength: AESKeyLength
  iv?: string
  tag?: string
}
