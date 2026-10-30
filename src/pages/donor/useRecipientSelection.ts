import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createRecipientSelection, type RecipientSelection } from './recommendations'

type SelectionState = {
  selections: Record<string, RecipientSelection>
  selectRecipient: (donationId: string, organizationId: string) => void
}

export const useRecipientSelection = create<SelectionState>()(persist((set) => ({
  selections: {},
  selectRecipient: (donationId, organizationId) => {
    const selection = createRecipientSelection(donationId, organizationId)
    if (selection) set((state) => ({ selections: { ...state.selections, [donationId]: selection } }))
  },
}), {
  name: 'issum-demo-recipient-selection',
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state) => ({ selections: state.selections }),
}))
