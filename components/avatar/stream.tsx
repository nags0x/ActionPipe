'use client';
import { useEffect, useRef } from 'react';
import StreamingAvatar, { TaskType, AvatarQuality } from '@heygen/streaming-avatar';

export function AvatarStream(){
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAndStartAvatar = async () => {
            try {
                const response = await fetch('/api/heygen-token', {
                    method: 'POST',
                  });

                const { token } = await response.json();

                    
                console.log('Token available:', !!token);

                if (!token) {
                    throw new Error('Failed to get token');
                }

                const avatar = new StreamingAvatar({ 
                    token: token,
                });


                const startSession = async () => {
                    try {
                        const sessionData = await avatar.createStartAvatar({
                            avatarName: 'MyAvatar',
                            quality: AvatarQuality.High
                        });
                    
                        console.log('Session started:', sessionData.session_id);
                    
                        await avatar.speak({
                            text: 'Hello, world!',
                            task_type: TaskType.REPEAT
                        });
                    } catch (error) {
                        console.error('Avatar error:', error);
                    }
                };

                startSession();
            } catch (error) {
                console.error('Failed to initialize avatar:', error);
            }
        };

        fetchAndStartAvatar();

        // Cleanup function
        return () => {
            // Add cleanup if needed
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            id="avatar-container"
            className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
        />
    );
}

