'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import * as fal from '@fal-ai/serverless-client';
import { useEffect, useState } from 'react';
import { Loader, ArrowDownToLine } from 'lucide-react';
fal.config({
	proxyUrl: '/api/fal/proxy',
});

const initialImages = [
	'https://images.unsplash.com/photo-1701690774955-7d06cfd3f857?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	'https://images.unsplash.com/photo-1701014159141-639d07c4eba4?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	'https://images.unsplash.com/photo-1720727226811-44865cb31c23?q=80&w=1915&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	'https://images.unsplash.com/photo-1692607038295-d651a294abd0?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	'https://plus.unsplash.com/premium_photo-1721893171616-ac33fcb70908?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	'https://images.unsplash.com/photo-1657969418028-3be399356ad6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	'https://images.unsplash.com/photo-1700074334190-42dee8240c4e?q=80&w=1943&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];
const getRandomImage = () => {
	return initialImages[Math.floor(Math.random() * initialImages.length)];
};
export default function Home() {
	const [prompt, setPrompt] = useState('');
	const [image, setImage] = useState(getRandomImage);
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
