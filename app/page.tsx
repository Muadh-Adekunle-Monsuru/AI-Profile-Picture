'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import * as fal from '@fal-ai/serverless-client';
import { useState } from 'react';
import { Loader, ArrowDownToLine } from 'lucide-react';
fal.config({
	proxyUrl: '/api/fal/proxy',
});

export default function Home() {
	const [prompt, setPrompt] = useState('');
	const [image, setImage] = useState(
		'https://images.unsplash.com/photo-1701014159251-f86a81a6fe13?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
	);
	const [loading, setLoading] = useState(false);
	const handleSubmit = async () => {
		if (!prompt) return;
		setLoading(true);
		const result: any = await fal.subscribe('110602490-lora', {
			input: {
				prompt,
				model_name: 'stabilityai/stable-diffusion-xl-base-1.0',
				image_size: 'square_hd',
			},
			pollInterval: 5000,
			logs: true,
			onQueueUpdate(update) {
				console.log('queue update', update);
			},
		});

		console.log(result);
		setImage(result.images[0].url);
		setLoading(false);
	};
	const handleDownload = async () => {
		try {
			const response = await fetch(image);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			// Create a temporary anchor element to initiate the download
			const link = document.createElement('a');
			link.href = url;
			link.download = 'downloaded-image.jpg'; // Default filename
			document.body.appendChild(link);
			link.click();

			// Clean up
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to download image', error);
		}
	};
	return (
		<main className='flex min-h-screen flex-col items-center justify-center gap-5  backdrop-blur-sm bg-black/20 '>
			<h1 className='text-center font-semibold text-4xl  blur-[0.3px] drop-shadow-sm'>
				AI Profile Picture
			</h1>
			<p className='text-xs'>
				Powered By{' '}
				<a href='https://stability.ai/' className='font-medium'>
					Stable Diffusion
				</a>
			</p>
			<div className='size-72 rounded-full border-2 drop-shadow-sm bg-slate-100 flex items-center justify-center overflow-hidden relative'>
				{loading && (
					<div className=' flex items-center justify-center flex-col'>
						<Loader className='size-5 animate-spin' />
						<p className='animate-pulse'>Generating... </p>
					</div>
				)}
				{image && !loading && (
					<img src={image} className='w-full h-full object-cover' />
				)}
			</div>
			{image && !loading && (
				<Button variant={'ghost'} onClick={handleDownload}>
					Download
					<ArrowDownToLine className='size-4 inline ml-2' />
				</Button>
			)}
			<div className='px-5 flex flex-col gap-2 md:flex-row w-full max-w-sm items-center space-x-2'>
				<Input
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder='Type your desciption here.'
					id='message'
					className='bg-white/50'
				/>
				<Button onClick={() => handleSubmit()} type='submit' disabled={loading}>
					{loading ? 'Generating...' : 'Generate'}
				</Button>
			</div>
		</main>
	);
}
