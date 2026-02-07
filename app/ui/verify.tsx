'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChangeEvent, Fragment, KeyboardEvent, useEffect,useRef, useState } from 'react';

import { verifyUser } from '@/app/lib/actions';
import Button from '@/app/ui/button';
import { NumberInput } from '@/app/ui/input';

export default function Verify() {
	const { data: session, update } = useSession();

	const userId = session?.user?.id;
	const ckey = session?.user?.ckey;

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));

	const router = useRouter();

	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/';

	useEffect(() => {
    if (ckey) router.push(callbackUrl);
  }, [callbackUrl, ckey, router]);

  const input1 = useRef(null);
  const input2 = useRef(null);
  const input3 = useRef(null);
  const input4 = useRef(null);
  const input5 = useRef(null);
  const input6 = useRef(null);

  const inputs: React.RefObject<HTMLInputElement | null>[] = [input1, input2, input3, input4, input5, input6];

  const handleChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value;

    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    const lastChar = value.slice(-1);
    newOtp[index] = lastChar;
    setOtp(newOtp);

    if (lastChar !== '' && index < 5) {
      inputs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs[index - 1].current?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData.getData('text');
    const clean = pasted.replace(/\D/g, '').slice(0, 6);

    if (clean.length > 0) {
      const newOtp = [...otp];
      clean.split('').forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);

      const focus = clean.length < 6 ? clean.length : 5;
      inputs[focus].current?.focus();

			if (clean.length === 6) {
				handleSubmit();
			}
    }
  };

	const handleSubmit = async () => {
		if (!userId) return;

    const raw = otp.join('');
    if (raw.length !== 6) return;

		const formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;

		setIsLoading(true);
		setError(null);

		try {
			const { success, message } = await verifyUser(formatted);

			if (success) {
				await update();
				router.push(callbackUrl);
			} else {
				setError(message);
			}
		} catch (e) {
			setError(String(e) || 'Bilinmeyen bir hata oluştu.');
		}

		setIsLoading(false);
  };

	if (ckey) {
		return (
			<div className="p-8 text-center">
				<h2 className="text-2xl font-bold mb-2">Hesap Doğrulama</h2>
				<p className="text-green-400 text-sm">Yönlendiriliyorsunuz...</p>
			</div>
		);
	}

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Hesap Doğrulama</h2>
        <p className="text-gray-400 text-sm">Lütfen oyuna girmeye çalışınca karşınıza çıkan 6 haneli kodu girin</p>
				{!!error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <div className="flex items-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <Fragment key={index}>
						<Button>
							<NumberInput
								ref={inputs[index]}
								placeholder={String(index + 1)}
								value={digit}
								onChange={(e) => handleChange(e, index)}
								onKeyDown={(e) => handleKeyDown(e, index)}
								className="w-8 h-12 text-2xl font-bold rounded-lg focus:placeholder:text-transparent"
								min={0}
								max={9}
							/>
						</Button>
            {index === 2 && <span className="text-2xl text-zinc-600 font-bold">-</span>}
          </Fragment>
        ))}
      </div>
			<Button onClick={handleSubmit} disabled={isLoading || otp.some(v => v === '')}>
				{isLoading ? <Icon icon={faSpinner} spin /> : 'Kodu Onayla'}
			</Button>
    </div>
  );
}
