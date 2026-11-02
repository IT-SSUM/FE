import { useSearchParams } from 'react-router-dom'
import { DonationForm } from '@/features/donor/DonationForm'
export function DonationRegisterPage() {
  const [params] = useSearchParams()
  const needId = params.get('needId') ?? ''
  const presets: Record<string, { name: string; category: string }> = {
    'water-20': { name: '생수', category: '미사용 소모품' },
    'clothes-10': { name: '의류', category: '의류·잡화' },
    'books-10': { name: '아동 도서', category: '도서·문구' },
  }
  return <DonationForm key={needId} preset={Object.hasOwn(presets, needId) ? presets[needId] : undefined} />
}
