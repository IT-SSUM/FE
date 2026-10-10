import { BookOpen, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ChatBubble } from '@/components/common/ChatBubble/ChatBubble'
import { routePath } from '@/constants/routes'

const chatMessages = [
  {
    id: 'peer-1',
    side: 'peer' as const,
    message: '안녕하세요! 도서 기부 정말 감사합니다',
    time: '오후 1:40',
  },
  {
    id: 'self-1',
    side: 'self' as const,
    message: '안녕하세요. 금요일 오후 2시에 직접 전달해도 괜찮을까요?',
    time: '읽음 · 오후 1:41',
  },
  {
    id: 'peer-2',
    side: 'peer' as const,
    message: '네, 좋아요! 센터 입구에서 뵐게요.',
    time: '오후 1:42',
  },
]

export function ChatRoomPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">
          구로지역아동센터
        </h1>
      </header>

      <button
        type="button"
        onClick={() => navigate(routePath.tradeDetail('mock-trade-1'))}
        className="flex h-[84px] shrink-0 items-center gap-3 border border-neutral-200 bg-white p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
      >
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-input bg-error-bg text-primary-700">
          <BookOpen aria-hidden size={28} strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate typography-title-3 text-neutral-900">
            어린이 도서 30권
          </strong>
          <span className="mt-1 block typography-label-2 text-primary-700">
            예약중 · 나눔 상세 보기 →
          </span>
        </span>
      </button>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <p className="typography-label-2 text-center text-neutral-700">
          2026년 10월 6일 화요일
        </p>

        <section className="mt-4 rounded-card bg-primary-100 p-3 text-center">
          <h2 className="typography-label-1 text-primary-700">
            나눔이 연결됐어요
          </h2>
          <p className="mt-1 typography-label-2 text-neutral-700">
            전달 날짜·장소·방법을 함께 정해 주세요.
          </p>
        </section>

        <section className="mt-4 space-y-4" aria-label="대화 내역">
          {chatMessages.map((chat) => (
            <MessageRow key={chat.id} chat={chat} />
          ))}

          <article className="rounded-card border border-neutral-200 bg-white px-3 py-3">
            <h2 className="typography-label-1 text-primary-700">
              전달 약속 · 10월 9일 오후 2시
            </h2>
            <p className="mt-1 typography-label-2 text-neutral-700">
              구로지역아동센터 입구 · 직접 전달
            </p>
          </article>
        </section>
      </main>

      <form
        className="flex shrink-0 items-center gap-3 bg-white px-6 py-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="chat-message">
          메시지 입력
        </label>
        <input
          id="chat-message"
          type="text"
          placeholder="메시지를 입력하세요"
          className="h-11 min-w-0 flex-1 rounded-pill bg-neutral-100 px-3 typography-body-2 text-neutral-900 outline-none placeholder:text-neutral-600 focus:ring-2 focus:ring-primary-700"
        />
        <button
          type="submit"
          className="h-11 w-14 shrink-0 rounded-pill bg-neutral-200 typography-label-1 text-neutral-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          전송
        </button>
      </form>
    </div>
  )
}

type MessageRowProps = {
  chat: (typeof chatMessages)[number]
}

function MessageRow({ chat }: MessageRowProps) {
  const isSelf = chat.side === 'self'

  return (
    <div className={isSelf ? 'text-right' : 'text-left'}>
      <div className={isSelf ? '' : 'flex items-start gap-2'}>
        {!isSelf ? (
          <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-pill bg-primary-200 text-primary-700">
            <BookOpen aria-hidden size={18} strokeWidth={2} />
          </span>
        ) : null}
        <ChatBubble side={chat.side}>{chat.message}</ChatBubble>
      </div>
      <p className="mt-1 typography-label-2 text-neutral-700">{chat.time}</p>
    </div>
  )
}
