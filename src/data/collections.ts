import type { Collection } from './icons'

export interface CollectionInfo {
  id: Collection
  name: string
}

export const COLLECTIONS: CollectionInfo[] = [
  { id: 'lucide', name: 'Lucide' },
  { id: 'tabler', name: 'Tabler' },
  { id: 'phosphor', name: 'Phosphor' },
]
