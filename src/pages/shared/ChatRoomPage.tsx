import { useState, type FormEvent } from 'react'
import { ArrowRight, BookOpen, ChevronLeft, Plus } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BottomSheet } from '@/components/common/BottomSheet/BottomSheet'
import { ChatBubble } from '@/components/common/ChatBubble/ChatBubble'
import { DateField } from '@/components/common/DateField/DateField'
import { TimeField } from '@/components/common/TimeField/TimeField'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

type ChatMessage = {
  id: string
  side: 'peer' | 'self'
  message: string
  time: string
}

type DeliveryAppointment = {
  date: string
  time: string
  location: string
  method: '직접 전달' | '택배 전달'
}

const organizationMessages: ChatMessage[] = [
  {
    id: 'peer-1',
    side: 'peer',
    message: '안녕하세요! 생수 10개를 기부할 수 있어요.',
    time: '오후 1:40',
  },
  {
    id: 'self-1',
    side: 'self',
    message: '정말 감사합니다. 토요일 오후 2시에 수령 가능할까요?',
    time: '오후 1:41',
  },
  {
    id: 'peer-2',
    side: 'peer',
    message: '네! 토요일 오후 2시에 뵐게요.',
    time: '오후 1:44',
  },
]

const donorMessages: ChatMessage[] = [
  {
    id: 'peer-1',
    side: 'peer',
    message: '안녕하세요! 도서 기부 정말 감사합니다',
    time: '오후 1:40',
  },
  {
    id: 'self-1',
    side: 'self',
    message: '안녕하세요. 금요일 오후 2시에 직접 전달해도 괜찮을까요?',
    time: '읽음 · 오후 1:41',
  },
  {
    id: 'peer-2',
    side: 'peer',
    message: '네, 좋아요! 센터 입구에서 뵐게요.',
    time: '오후 1:42',
  },
]

type ChatConversation = {
  peerName: string
  itemTitle: string
  messages: ChatMessage[]
}

function createMessages(
  peerMessage: string,
  selfMessage: string,
  peerReply: string,
): ChatMessage[] {
  return [
    { id: 'peer-1', side: 'peer', message: peerMessage, time: '오후 1:40' },
    { id: 'self-1', side: 'self', message: selfMessage, time: '읽음 · 오후 1:41' },
    { id: 'peer-2', side: 'peer', message: peerReply, time: '오후 1:42' },
  ]
}

const chatConversations: Record<string, ChatConversation> = {
  'donor-choi-yoonseo': {
    peerName: '최윤서',
    itemTitle: '생수 10개',
    messages: organizationMessages,
  },
  'donor-choi-hyobi': {
    peerName: '최효비',
    itemTitle: '생수 10개',
    messages: createMessages(
      '안녕하세요. 생수 10개를 기부하고 싶어요.',
      '감사합니다. 토요일 오후 2시에 가능할까요?',
      '네, 그 시간에 방문할게요.',
    ),
  },
  'donor-choi-kkokko': {
    peerName: '홍길동',
    itemTitle: '의류 3벌',
    messages: createMessages(
      '아동 의류 3벌을 나누고 싶습니다.',
      '고맙습니다. 물품 상태를 확인할 수 있을까요?',
      '네, 사진과 함께 보내드릴게요.',
    ),
  },
  'guro-child-center': {
    peerName: '구로지역아동센터',
    itemTitle: '어린이 도서 30권',
    messages: donorMessages,
  },
  'guro-welfare-center': {
    peerName: '구로희망복지관',
    itemTitle: '수건 10장',
    messages: createMessages(
      '수건 10장을 지원받고 싶어요.',
      '네, 깨끗하게 포장해서 전달드릴게요.',
      '감사합니다. 일정은 채팅으로 조율해요.',
    ),
  },
  'guro-dream-center': {
    peerName: '구로꿈나무센터',
    itemTitle: '학용품 20세트',
    messages: createMessages(
      '아이들이 사용할 학용품이 필요해요.',
      '학용품 20세트를 기부할 수 있어요.',
      '감사합니다. 전달 일정을 정해볼까요?',
    ),
  },
  'guro-reserved-center': {
    peerName: '구로지역아동센터',
    itemTitle: '생수 12개',
    messages: createMessages(
      '예약한 생수 12개 확인했습니다.',
      '금요일 오후 2시에 직접 전달할게요.',
      '네, 센터 입구에서 뵙겠습니다.',
    ),
  },
  'seoul-dream-center': {
    peerName: '서울꿈나무센터',
    itemTitle: '아동 도서 12권',
    messages: createMessages(
      '보내주신 아동 도서를 잘 받았어요.',
      '아이들에게 도움이 되면 좋겠습니다.',
      '소중한 나눔 감사합니다.',
    ),
  },
}

function getLocalToday() {
  return new Date().toLocaleDateString('sv-SE')
}

export function ChatRoomPage() {
  const navigate = useNavigate()
  const { chatRoomId } = useParams()
  const [searchParams] = useSearchParams()
  const isOrganization = searchParams.get('audience') === 'organization'
  const fallbackRoomId = isOrganization
    ? 'donor-choi-yoonseo'
    : 'guro-child-center'
  const conversation =
    chatConversations[chatRoomId ?? ''] ?? chatConversations[fallbackRoomId]
  const roomId = chatRoomId ?? fallbackRoomId
  const [messagesByRoom, setMessagesByRoom] = useState<
    Record<string, ChatMessage[]>
  >({})
  const messages = messagesByRoom[roomId] ?? conversation.messages
  const [message, setMessage] = useState('')
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const [appointment, setAppointment] = useState<DeliveryAppointment | null>(null)
  const [today] = useState(getLocalToday)
  const [appointmentDate, setAppointmentDate] = useState(today)
  const [appointmentTime, setAppointmentTime] = useState('14:00')
  const [appointmentLocation, setAppointmentLocation] = useState(
    '구로지역아동센터 입구',
  )
  const [appointmentMethod, setAppointmentMethod] =
    useState<DeliveryAppointment['method']>('직접 전달')
  const [appointmentError, setAppointmentError] = useState('')

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setMessagesByRoom((current) => ({
      ...current,
      [roomId]: [
        ...(current[roomId] ?? conversation.messages),
        {
          id: `self-${Date.now()}`,
          side: 'self',
          message: trimmedMessage,
          time: new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).format(new Date()),
        },
      ],
    }))
    setMessage('')
  }

  const saveAppointment = () => {
    if (!appointmentDate || !appointmentTime || !appointmentLocation.trim()) return
    if (appointmentDate < today) {
      setAppointmentError('오늘 이후 날짜를 선택해 주세요.')
      return
    }
    setAppointment({
      date: appointmentDate,
      time: appointmentTime,
      location: appointmentLocation.trim(),
      method: appointmentMethod,
    })
    setAppointmentError('')
    setAppointmentOpen(false)
  }

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
        <h1 className="text-base font-bold leading-6 text-neutral-900">
          {conversation.peerName}
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
          <strong className="block truncate text-base font-bold leading-6 text-neutral-900">
            {conversation.itemTitle}
          </strong>
          <span className="mt-1 flex items-center gap-1 text-xs font-medium leading-[18px] text-primary-700">
            {appointment ? '예약중' : '거래중'} · 거래 상세 보기
            <ArrowRight aria-hidden size={14} strokeWidth={2} />
          </span>
        </span>
      </button>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {appointment ? (
          <section className="mb-4 rounded-card bg-primary-100 p-3">
            <h2 className="text-xs font-semibold leading-[18px] text-primary-700">
              전달 약속 · {formatAppointmentDate(appointment.date)} {formatAppointmentTime(appointment.time)}
            </h2>
            <p className="mt-1 text-xs font-normal leading-[18px] text-neutral-700">
              {appointment.location} · {appointment.method}
            </p>
          </section>
        ) : null}

        <p className="text-center text-xs font-normal leading-[18px] text-neutral-700">
          2026년 10월 6일 화요일
        </p>

        {!appointment ? (
          <section className="mt-4 rounded-card bg-primary-100 p-3 text-center">
            <h2 className="text-sm font-semibold leading-5 text-primary-700">
              {isOrganization
                ? '물품 지원이 연결됐어요'
                : '나눔이 연결됐어요'}
            </h2>
            <p className="mt-1 text-xs font-normal leading-[18px] text-neutral-700">
              채팅은 양측 누구나 시작할 수 있어요.
              <br />
              예약·기부 확정은 의미하지 않아요.
            </p>
          </section>
        ) : null}

        <section className="mt-4 space-y-4" aria-label="대화 내역">
          {messages.map((chat) => (
            <MessageRow key={chat.id} chat={chat} />
          ))}
        </section>
      </main>

      <form
        className="flex shrink-0 items-center gap-3 bg-white px-6 py-4"
        onSubmit={sendMessage}
      >
        <button
          type="button"
          aria-label={appointment ? '전달 약속 수정하기' : '전달 약속 정하기'}
          onClick={() => setAppointmentOpen(true)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-700"
        >
          <Plus aria-hidden size={22} strokeWidth={2} />
        </button>
        <label className="sr-only" htmlFor="chat-message">
          메시지 입력
        </label>
        <input
          id="chat-message"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="메시지를 입력하세요"
          className="h-11 min-w-0 flex-1 rounded-pill bg-neutral-100 px-3 text-sm font-normal leading-[22px] text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-600 focus:ring-2 focus:ring-primary-700"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="h-11 w-14 shrink-0 rounded-pill bg-primary-700 text-sm font-bold leading-5 text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:bg-neutral-200 disabled:text-neutral-700"
        >
          전송
        </button>
      </form>

      <BottomSheet
        open={appointmentOpen}
        title={appointment ? '전달 약속 수정' : '전달 약속 정하기'}
        primaryText={appointment ? '수정 저장' : '약속 저장'}
        secondaryText="취소"
        onPrimaryClick={saveAppointment}
        onSecondaryClick={() => setAppointmentOpen(false)}
        className="max-w-[353px]"
      >
        <div className="space-y-4">
          <DateField
            id="delivery-appointment-date"
            label="전달 날짜"
            value={appointmentDate}
            min={today}
            yearOrder="ascending"
            onChange={(value) => {
              setAppointmentDate(value)
              setAppointmentError('')
            }}
          />
          {appointmentError ? (
            <p className="typography-label-2 text-error" role="alert">
              {appointmentError}
            </p>
          ) : null}

          <TimeField
            id="delivery-appointment-time"
            label="전달 시간"
            value={appointmentTime}
            onChange={setAppointmentTime}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium leading-5 text-neutral-900">
              전달 장소
            </span>
            <input
              type="text"
              value={appointmentLocation}
              onChange={(event) => setAppointmentLocation(event.target.value)}
              className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none focus:border-primary-700"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium leading-5 text-neutral-900">
              전달 방법
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['직접 전달', '택배 전달'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  aria-pressed={appointmentMethod === method}
                  onClick={() => setAppointmentMethod(method)}
                  className={cn(
                    'h-11 rounded-control border text-sm font-medium',
                    appointmentMethod === method
                      ? 'border-primary-300 bg-primary-100 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-700',
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </BottomSheet>
    </div>
  )
}

function formatAppointmentDate(value: string) {
  const [, month, day] = value.split('-').map(Number)
  return `${month}월 ${day}일`
}

function formatAppointmentTime(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 || 12
  return `${period} ${displayHour}시${minute ? ` ${minute}분` : ''}`
}

type MessageRowProps = {
  chat: ChatMessage
}

function MessageRow({ chat }: MessageRowProps) {
  const isSelf = chat.side === 'self'

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isSelf ? 'justify-end' : 'justify-start',
      )}
    >
      {!isSelf ? (
        <span className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-pill bg-primary-200 text-primary-700">
          <BookOpen aria-hidden size={18} strokeWidth={2} />
        </span>
      ) : null}
      {isSelf ? (
        <p className="shrink-0 pb-1 text-xs font-normal leading-[18px] text-neutral-700">
          {chat.time}
        </p>
      ) : null}
      <div>
        <ChatBubble side={chat.side}>{chat.message}</ChatBubble>
      </div>
      {!isSelf ? (
        <p className="shrink-0 pb-1 text-xs font-normal leading-[18px] text-neutral-700">
          {chat.time}
        </p>
      ) : null}
    </div>
  )
}
