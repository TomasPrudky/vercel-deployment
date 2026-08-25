'use client';

import React, { useEffect, useRef } from 'react';

export default function BouncingBall() {
    const ballRef = useRef(null);

    useEffect(() => {
        const ball = ballRef.current;
        if (!ball) return;

        // Počáteční parametry míče
        const size = 38; // velikost v px
        let x = Math.random() * (window.innerWidth - size);
        let y = Math.random() * (window.innerHeight - size);
        let vx = (Math.random() > 0.5 ? 1 : -1) * 2.2; // rychlost X
        let vy = (Math.random() > 0.5 ? 1 : -1) * 1.8; // rychlost Y
        let rotation = 0;
        let animationFrameId;

        const animate = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            x += vx;
            y += vy;
            rotation += vx * 1.5;

            // Odraz od bočních stěn
            if (x <= 0) {
                x = 0;
                vx = -vx;
            } else if (x + size >= width) {
                x = width - size;
                vx = -vx;
            }

            // Odraz od horní a dolní stěny
            if (y <= 0) {
                y = 0;
                vy = -vy;
            } else if (y + size >= height) {
                y = height - size;
                vy = -vy;
            }

            ball.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div
            ref={ballRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                fontSize: '38px',
                lineHeight: 1,
                width: '42px',
                height: '42px',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 0, /* zůstává na pozadí */
                opacity: 0.25,
                willChange: 'transform',
            }}
            aria-hidden="true"
        >
            ⚽
        </div>
    );
}