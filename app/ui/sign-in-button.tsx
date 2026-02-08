'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

import Button from '@/app/ui/button';
import Dropdown from '@/app/ui/dropdown';

const menuItems = [
  { label: 'Hesabım', href: '/me' },
	{ label: 'Arkadaşlar', href: '/me/friends' },
	{ label: 'Roundlar', href: '/me/rounds' },
	{ label: 'Banlar', href: '/me/bans' },
	{ label: 'Ticketlar', href: '/me/tickets' },
	{ label: 'Mesajlar', href: '/me/admin-remarks' },
	{ label: 'Çıkış Yap', action: async () => await signOut(), class: 'text-red-500' }
];

export default function SignInButton() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
    return;
  }

	if(session && session.user) {
		return <Dropdown items={menuItems}><Button>{session.user.name}</Button></Dropdown>;
	}

	return <Button onClick={() => signIn('discord')}>Giriş Yap</Button>;
}
