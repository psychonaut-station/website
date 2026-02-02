'use client';

import { useEffect, useMemo, useRef } from 'react';

import placeholder from '@/app/images/empty-character.png';
import { playerSpriteImageLoader } from '@/app/lib/image-loader';

export enum Direction { Front = 0, Back = 1, Right = 2, Left = 3 }
enum Area { Full = 0, Biometric = 1 }

const characterSize = 32;
const biometricOffset = 7.5;

type PlayerSpriteProps = {
	ckey: string;
	character?: string;
  job?: string;
  direction?: Direction;
  scale?: number;
}

export default function PlayerSprite({ ckey, character, job, direction = Direction.Front, scale = 1 }: PlayerSpriteProps) {
	const ref = useRef<HTMLDivElement>(null);
	const src = useMemo(() => character && playerSpriteImageLoader({ src: `${ckey}/${encodeURI(character)}.png`, width: characterSize * scale }), [ckey, character, scale]);
  const area = job === 'Animal' ? Area.Full : Area.Biometric;

  useEffect(() => {
    if (!src) return;

    const image = new Image();
    image.src = src;

    image.onload = () => {
      ref.current?.style.setProperty('background-image', `url(${src})`);
    };
  }, [src]);

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
			ref={ref}
      style={{
        transform: `scale(${scaleFactor})`,
        width: frameSize,
        height: frameSize,
        backgroundImage: `url(${placeholder.src})`,
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
