import { useEffect, useState } from 'react'
import { Check, ChevronDown, MapPin, Search } from 'lucide-react'
import { useViewportPopover } from '@/hooks/useViewportPopover'
import { cn } from '@/utils/cn'

type RegionSelectProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
}

const regions: Record<string, string[]> = {
  서울특별시: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  부산광역시: ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  대구광역시: ['군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  인천광역시: ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
  광주광역시: ['광산구', '남구', '동구', '북구', '서구'],
  대전광역시: ['대덕구', '동구', '서구', '유성구', '중구'],
  울산광역시: ['남구', '동구', '북구', '울주군', '중구'],
  세종특별자치시: ['세종시'],
  경기도: ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '여주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시', '가평군', '양평군', '연천군'],
  강원특별자치도: ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '고성군', '양구군', '양양군', '영월군', '인제군', '정선군', '철원군', '평창군', '홍천군', '화천군', '횡성군'],
  충청북도: ['제천시', '청주시', '충주시', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '증평군', '진천군'],
  충청남도: ['계룡시', '공주시', '논산시', '당진시', '보령시', '서산시', '아산시', '천안시', '금산군', '부여군', '서천군', '예산군', '청양군', '태안군', '홍성군'],
  전북특별자치도: ['군산시', '김제시', '남원시', '익산시', '전주시', '정읍시', '고창군', '무주군', '부안군', '순창군', '완주군', '임실군', '장수군', '진안군'],
  전라남도: ['광양시', '나주시', '목포시', '순천시', '여수시', '강진군', '고흥군', '곡성군', '구례군', '담양군', '무안군', '보성군', '신안군', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  경상북도: ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '안동시', '영주시', '영천시', '포항시', '고령군', '봉화군', '성주군', '영덕군', '영양군', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군'],
  경상남도: ['거제시', '김해시', '밀양시', '사천시', '양산시', '진주시', '창원시', '통영시', '거창군', '고성군', '남해군', '산청군', '의령군', '창녕군', '하동군', '함안군', '함양군', '합천군'],
  제주특별자치도: ['서귀포시', '제주시'],
}

export function RegionSelect({ id, label, value, onChange, optional = false }: RegionSelectProps) {
  const [openPanel, setOpenPanel] = useState<'province' | 'district' | null>(null)
  const [query, setQuery] = useState('')
  const { anchorRef: containerRef, popoverStyle } = useViewportPopover<HTMLFieldSetElement>(
    Boolean(openPanel),
    360,
  )
  const province = Object.keys(regions).find(
    (region) => value === region || value.startsWith(`${region} `),
  ) ?? ''
  const district = province ? value.slice(province.length).trim() : ''
  const districts = province ? regions[province] ?? [] : []
  const options = openPanel === 'province' ? Object.keys(regions) : districts
  const filteredOptions = options.filter((option) => option.includes(query.trim()))

  useEffect(() => {
    if (!openPanel) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpenPanel(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openPanel, containerRef])

  const togglePanel = (panel: 'province' | 'district') => {
    setQuery('')
    setOpenPanel((current) => current === panel ? null : panel)
  }

  const selectOption = (option: string) => {
    if (openPanel === 'province') {
      onChange(option)
      setQuery('')
      setOpenPanel('district')
      return
    }

    onChange(`${province} ${option}`)
    setOpenPanel(null)
  }

  return (
    <fieldset ref={containerRef} className="relative m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 block text-sm font-medium leading-5 text-neutral-900">
        {label}{optional ? ' (선택)' : ''}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        <button
          id={`${id}-province`}
          type="button"
          className="flex h-[52px] min-w-0 items-center gap-[7px] rounded-input border border-neutral-500 bg-white px-3 text-left text-[13px] text-neutral-900 transition-shadow hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-700/10 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>svg]:shrink-0 [&>svg]:text-primary-700"
          aria-haspopup="listbox"
          aria-expanded={openPanel === 'province'}
          onClick={() => togglePanel('province')}
        >
          <MapPin aria-hidden size={17} />
          <span className={province ? '' : 'text-neutral-600'}>{province || '시·도'}</span>
          <ChevronDown aria-hidden size={17} />
        </button>
        <button
          id={`${id}-district`}
          type="button"
          aria-label="시·군·구"
          className="flex h-[52px] min-w-0 items-center gap-[7px] rounded-input border border-neutral-500 bg-white px-3 text-left text-[13px] text-neutral-900 transition-shadow hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-700/10 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-500 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>svg]:shrink-0 [&>svg]:text-primary-700 disabled:[&>svg]:text-neutral-400"
          aria-haspopup="listbox"
          aria-expanded={openPanel === 'district'}
          disabled={!province}
          onClick={() => togglePanel('district')}
        >
          <span className={district ? '' : 'text-neutral-600'}>{district || '시·군·구'}</span>
          <ChevronDown aria-hidden size={17} />
        </button>
      </div>

      {openPanel ? (
        <section
          className="z-100 flex flex-col overflow-hidden rounded-[18px] border border-neutral-300 bg-white shadow-[0_18px_42px_rgb(18_61_49/16%)]"
          style={popoverStyle}
          aria-label={`${openPanel === 'province' ? '시·도' : '시·군·구'} 선택`}
        >
          <div className="shrink-0 px-4 pb-3 pt-4">
            <strong className="block text-sm leading-5 text-neutral-900">{openPanel === 'province' ? '시·도를 선택해 주세요' : `${province} 지역 선택`}</strong>
            <label className="mt-2.5 flex h-10 items-center gap-2 rounded-xl bg-neutral-100 px-3 text-neutral-600">
              <Search aria-hidden size={16} />
              <input
                autoFocus
                value={query}
                placeholder="지역 검색"
                aria-label="지역 검색"
                className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-neutral-900 outline-none"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="grid min-h-0 max-h-[230px] flex-1 grid-cols-2 gap-1.5 overflow-y-auto border-t border-neutral-200 p-3" role="listbox">
            {filteredOptions.map((option) => {
              const selected = openPanel === 'province' ? option === province : option === district
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex min-h-[42px] min-w-0 items-center justify-between gap-1.5 rounded-xl border border-transparent bg-transparent px-2.5 py-2 text-left text-xs text-neutral-800 hover:bg-[#f4f8f5] [&>svg]:shrink-0',
                    selected && 'border-primary-300 bg-primary-100 font-bold text-primary-700',
                  )}
                  onClick={() => selectOption(option)}
                >
                  <span>{option}</span>
                  {selected ? <Check aria-hidden size={16} /> : null}
                </button>
              )
            })}
            {filteredOptions.length === 0 ? <p className="col-span-2 m-0 py-6 text-center text-[13px] text-neutral-600">검색 결과가 없어요.</p> : null}
          </div>
        </section>
      ) : null}
    </fieldset>
  )
}

