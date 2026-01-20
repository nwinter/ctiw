<script lang="ts">
	interface Message {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		codeSnippet?: string;
	}

	interface Props {
		currentCode: string;
		onInsertCode: (code: string) => void;
	}

	let { currentCode, onInsertCode }: Props = $props();

	let isOpen = $state(true);
	let messages = $state<Message[]>([
		{
			id: 'welcome',
			role: 'assistant',
			content: "Hi there! I'm your CTIW helper. I can help you write code, fix problems, or learn new things. Try asking me a question or click one of the quick buttons below!"
		}
	]);
	let inputMessage = $state('');
	let isLoading = $state(false);
	let messagesContainer = $state<HTMLDivElement | null>(null);

	// Quick action buttons
	const quickActions = [
		{ label: 'Fix my code', action: 'fix', icon: '🔧' },
		{ label: 'Explain this', action: 'explain', icon: '💡' },
		{ label: 'Add a button', action: 'button', icon: '🔘' },
		{ label: 'Make it colorful', action: 'color', icon: '🎨' }
	];

	async function sendMessage(message: string, action?: string) {
		if (!message.trim() && !action) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: 'user',
			content: action ? `Quick action: ${action}` : message
		};
		messages = [...messages, userMessage];
		inputMessage = '';
		isLoading = true;

		try {
			const response = await fetch('/api/assist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: message || action,
					code: currentCode,
					action: action
				})
			});

			const data = await response.json();

			const assistantMessage: Message = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: data.message,
				codeSnippet: data.codeSnippet
			};
			messages = [...messages, assistantMessage];
		} catch (error) {
			const errorMessage: Message = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: "Oops! Something went wrong. Let's try that again in a moment."
			};
			messages = [...messages, errorMessage];
		} finally {
			isLoading = false;
			// Scroll to bottom after new message
			setTimeout(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, 50);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage(inputMessage);
		}
	}

	function insertCode(code: string) {
		const isFullDocument = code.trim().startsWith('=CTIW=');
		onInsertCode(code);
		const confirmMessage: Message = {
			id: crypto.randomUUID(),
			role: 'assistant',
			content: isFullDocument
				? "I replaced your code with the new version. Take a look!"
				: "I added the snippet to your code (before ==CTIW==). Take a look!"
		};
		messages = [...messages, confirmMessage];
	}

	function getInsertButtonText(code: string): string {
		return code.trim().startsWith('=CTIW=') ? 'Replace code' : 'Add to editor';
	}
</script>

<div class="ai-assistant" class:collapsed={!isOpen}>
	<!-- Toggle Button -->
	<button
		class="toggle-btn"
		onclick={() => (isOpen = !isOpen)}
		aria-label={isOpen ? 'Collapse assistant' : 'Expand assistant'}
	>
		{#if isOpen}
			<span class="toggle-icon">→</span>
		{:else}
			<span class="toggle-icon">←</span>
			<span class="toggle-label">AI Helper</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="assistant-panel">
			<!-- Header -->
			<div class="panel-header">
				<h3>AI Helper</h3>
				<span class="helper-badge">Ready to help!</span>
			</div>

			<!-- Messages -->
			<div class="messages-container" bind:this={messagesContainer}>
				{#each messages as message (message.id)}
					<div class="message {message.role}">
						<div class="message-avatar">
							{message.role === 'assistant' ? '🤖' : '👤'}
						</div>
						<div class="message-content">
							<p>{message.content}</p>
							{#if message.codeSnippet}
								<div class="code-snippet">
									<pre><code>{message.codeSnippet}</code></pre>
									<button
										class="insert-btn"
										onclick={() => insertCode(message.codeSnippet!)}
									>
										{getInsertButtonText(message.codeSnippet!)}
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
				{#if isLoading}
					<div class="message assistant">
						<div class="message-avatar">🤖</div>
						<div class="message-content">
							<div class="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Quick Actions -->
			<div class="quick-actions">
				{#each quickActions as qa}
					<button
						class="quick-action-btn"
						onclick={() => sendMessage('', qa.action)}
						disabled={isLoading}
					>
						<span class="action-icon">{qa.icon}</span>
						<span class="action-label">{qa.label}</span>
					</button>
				{/each}
			</div>

			<!-- Input Area -->
			<div class="input-area">
				<input
					type="text"
					bind:value={inputMessage}
					onkeydown={handleKeydown}
					placeholder="Ask me anything about CTIW..."
					disabled={isLoading}
				/>
				<button
					class="send-btn"
					onclick={() => sendMessage(inputMessage)}
					disabled={isLoading || !inputMessage.trim()}
				>
					Send
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.ai-assistant {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.ai-assistant.collapsed {
		width: 60px;
		min-width: 60px;
	}

	.toggle-btn {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.toggle-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.toggle-icon {
		font-size: 16px;
	}

	.toggle-label {
		writing-mode: vertical-rl;
		text-orientation: mixed;
		white-space: nowrap;
	}

	.collapsed .toggle-btn {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		flex-direction: column;
		padding: 12px 8px;
	}

	.assistant-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 16px;
		padding-top: 56px;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.panel-header h3 {
		color: white;
		font-size: 20px;
		font-weight: 700;
		margin: 0;
	}

	.helper-badge {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 12px;
	}

	.message {
		display: flex;
		gap: 10px;
		margin-bottom: 16px;
	}

	.message:last-child {
		margin-bottom: 0;
	}

	.message-avatar {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #f0f0f0;
		font-size: 16px;
		flex-shrink: 0;
	}

	.message.assistant .message-avatar {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.message.user .message-avatar {
		background: #e0e7ff;
	}

	.message-content {
		flex: 1;
		min-width: 0;
	}

	.message-content p {
		margin: 0;
		color: #333;
		font-size: 14px;
		line-height: 1.5;
		word-wrap: break-word;
	}

	.code-snippet {
		margin-top: 12px;
		background: #1a1b26;
		border-radius: 8px;
		overflow: hidden;
	}

	.code-snippet pre {
		margin: 0;
		padding: 12px;
		overflow-x: auto;
	}

	.code-snippet code {
		color: #c0caf5;
		font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
		font-size: 13px;
		white-space: pre-wrap;
	}

	.insert-btn {
		width: 100%;
		padding: 10px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		color: white;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.insert-btn:hover {
		opacity: 0.9;
	}

	.typing-indicator {
		display: flex;
		gap: 4px;
		padding: 8px 0;
	}

	.typing-indicator span {
		width: 8px;
		height: 8px;
		background: #667eea;
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing {
		0%, 60%, 100% {
			transform: translateY(0);
			opacity: 0.4;
		}
		30% {
			transform: translateY(-4px);
			opacity: 1;
		}
	}

	.quick-actions {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin-bottom: 12px;
	}

	.quick-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 8px;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 600;
		color: #555;
		cursor: pointer;
		transition: all 0.2s;
	}

	.quick-action-btn:hover:not(:disabled) {
		background: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.quick-action-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-icon {
		font-size: 14px;
	}

	.input-area {
		display: flex;
		gap: 8px;
	}

	.input-area input {
		flex: 1;
		padding: 12px 16px;
		border: none;
		border-radius: 12px;
		font-size: 14px;
		background: rgba(255, 255, 255, 0.95);
		color: #333;
	}

	.input-area input:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
	}

	.input-area input::placeholder {
		color: #999;
	}

	.send-btn {
		padding: 12px 20px;
		background: white;
		border: none;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 600;
		color: #667eea;
		cursor: pointer;
		transition: all 0.2s;
	}

	.send-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.send-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
