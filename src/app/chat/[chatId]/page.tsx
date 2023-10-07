import { db } from '@/lib/DB'
import { chats } from '@/lib/DB/schema'
import { auth } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    params: {
        chatId: string
    }
}

const ChatPage = async ({params: {chatId}}: Props) => {
  const {userId} = auth();

  if (!userId) {
    return redirect('/sign-in')
    }
    
    const _chats =await db.select().from(chats).where(eq(chats.userId, userId));
    if (!_chats || !_chats.find(chat => chat.id === parseInt(chatId))) {
        return redirect('/')
    }

    return (
    <div className='flex max-h-screen overflow-scroll'>
        <div className=''></div>
    
    </div>
  )
}

export default ChatPage