'use client';

import { ImageLoaderProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import placeholder from '@/app/images/empty-character.png';
import { playerSpriteImageLoader } from '@/app/lib/image-loader';

export enum Direction { Front = 0, Back = 1, Right = 2, Left = 3 }
enum Area { Full = 0, Biometric = 1 }

const characterSize = 32;
const biometricOffset = 7.5;

type PlayerSpriteProps = {
	src: string | null;
	job?: string | null;
	direction?: Direction;
	scale?: number;
	loader?: (p: ImageLoaderProps) => string;
	allowEmpty?: boolean;
}

export default function Sprite({ src: source, job, direction = Direction.Front, scale = 1, loader = playerSpriteImageLoader, allowEmpty = true }: PlayerSpriteProps) {
	const [shouldRender, setShouldRender] = useState(allowEmpty);
	const [url, setUrl] = useState<string | null>(null);

	const src = useMemo(() => source && loader({ src: encodeURI(source), width: characterSize * scale }), [source, scale, loader]);

	const area = job === 'Animal' ? Area.Full : Area.Biometric;

  useEffect(() => {
    if (!src) return;

    const image = new Image();
    image.src = src;

    image.onload = () => {
			setUrl(src);
			setShouldRender(true);
    };
  }, [src]);

	if (!shouldRender) return null;

	// eslint-disable-next-line prefer-const
	let [offsetX, offsetY] = directionToOffset(direction);
	let frameSize = characterSize;
	let scaleFactor = scale;

	if (area === Area.Biometric) {
		frameSize /= 2;
		offsetX -= biometricOffset;
		scaleFactor *= 2;
	}

  return (
    <div
      className="inline-block bg-no-repeat pixelated"
      style={{
        transform: `scale(${scaleFactor})`,
        width: frameSize,
        height: frameSize,
        backgroundImage: `url(${url || placeholder.src})`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
}

function directionToOffset(direction: Direction): [number, number] {
	switch (direction) {
		case Direction.Front:
			return [0, 0];
		case Direction.Back:
			return [-characterSize, 0];
		case Direction.Right:
			return [0, -characterSize];
		case Direction.Left:
			return [-characterSize, -characterSize];
	}
}
