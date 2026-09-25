const modal = document.querySelector('.confirm-modal')
const columnsContainer = document.querySelector('.columns')
const columns = columnsContainer.querySelectorAll('.column')

let currentTask = null

const handleDragover = event => {
	event.preventDefault()

	const draggedTask = document.querySelector('.dragging')

	const target = event.target.closest('.tasks, .task')

	if (!target || target === draggedTask) return

	if (target.classList.contains('tasks')) {
		const lastChild = target.lastElementChild

		if (
			!lastChild ||
			event.clientY > lastChild.getBoundingClientRect().bottom
		) {
			target.appendChild(draggedTask)
			return
		}
	}

	if (target.classList.contains('task')) {
		const targetRect = target.getBoundingClientRect()
		const draggedRect = draggedTask.getBoundingClientRect()

		const isMovingDown = draggedRect.top < targetRect.top

		if (isMovingDown) {
			if (event.clientY > targetRect.top + 5) {
				target.after(draggedTask)
			}
		} else {
			if (event.clientY < targetRect.bottom - 5) {
				target.before(draggedTask)
			}
		}
	}
}

const handleDrop = event => {
	event.preventDefault()
}

const handleDragstart = event => {
	event.dataTransfer.dropEffect = 'move'
	event.dataTransfer.setData('text/plain', '')
	setTimeout(() => {
		requestAnimationFrame(() => event.target.classList.add('dragging'))
	}, 0)
}

const handleDragend = event => {
	setTimeout(() => {
		requestAnimationFrame(() => event.target.classList.remove('dragging'))
	}, 0)
}

const handleDelete = event => {
	currentTask = event.target.closest('.task')

	modal.querySelector('.preview').innerText = currentTask.innerText.substring(
		0,
		100
	)

	modal.showModal()
}

const handleEdit = event => {
	const task = event.target.closest('.task')
	const input = createTaskInput(task.innerText)
	task.replaceWith(input)
	input.focus()

	//move cursor to end
	const selection = window.getSelection()
	selection.selectAllChildren(input)
	selection.collapseToEnd()
}

const handleBlur = event => {
	const input = event.target
	const content = input.innerText.trim() || 'Untitle'
	const task = createTask(content.replace(/\n/g, '<br>'))
	input.replaceWith(task)
}

const handleAdd = event => {
	const tasksEl = event.target.closest('.column').lastElementChild
	const input = createTaskInput()
	tasksEl.appendChild(input)
	input.focus()
}

const updateTaskCount = column => {
	const tasksContainer = column.querySelector('.tasks')
	if (!tasksContainer) return

	const taskCount = tasksContainer.children.length

	const titleEl = column.querySelector('.column-title h3')

	if (titleEl) {
		titleEl.dataset.tasks = taskCount
	}
}

const observeTaskChanges = () => {
	for (const column of columns) {
		const observer = new MutationObserver(() => updateTaskCount(column))
		observer.observe(column.querySelector('.tasks'), { childList: true })
	}
}

observeTaskChanges()

const createTask = content => {
	const task = document.createElement('div')
	task.className = 'task'
	task.draggable = true
	task.innerHTML = `
		<div> ${content}	</div>
		<menu>
			<button data-edit><i class="bi bi-pencil-square"></i></button>
			<button data-delete><i class="bi bi-trash"></i></button>
		</menu>`
	task.addEventListener('dragstart', handleDragstart)
	task.addEventListener('dragend', handleDragend)
	return task
}

const createTaskInput = (text = '') => {
	const input = document.createElement('div')
	input.className = 'task-input'
	input.contentEditable = 'true'
	input.dataset.placeholder = 'Task name'
	input.innerText = text

	input.addEventListener('input', event => {
		if (event.target.textContent.trim() === '') {
			event.target.innerHTML = ''
		}
	})
	input.addEventListener('blur', handleBlur)
	return input
}

tasksElements = columnsContainer.querySelectorAll('.tasks')
for (const tasksEl of tasksElements) {
	tasksEl.addEventListener('dragover', handleDragover)
	tasksEl.addEventListener('drop', handleDrop)
}

columnsContainer.addEventListener('click', event => {
	if (event.target.closest('button[data-add]')) {
		handleAdd(event)
	} else if (event.target.closest('button[data-edit]')) {
		handleEdit(event)
	} else if (event.target.closest('button[data-delete]')) {
		handleDelete(event)
	}
})

modal.addEventListener('submit', event => {
	event.preventDefault()

	if (currentTask) {
		currentTask.remove()
		currentTask = null
	}

	modal.close()
})

modal.querySelector('#cancel').addEventListener('click', () => modal.close())

modal.addEventListener('close', () => (currentTask = null))

let tasks = [
	[
		'Gather inspiration for layout ideas 🖌️',
		'Research Color Palette 🖍️',
		'Brand and Logo Design 🎨',
	],
	[
		'Optimize Image Assets 🏞️',
		'Cross-Browser Testing 🌐',
		'Integrate Livechat 💬',
	],
	[
		'Set Up Custom Domain 🌍',
		'Deploy Website 🚀',
		'Fix Bugs 🛠️',
		'Team Meeting 📅',
	],
	[
		'Write Report 📊',
		'Code Review 💻',
		'Implement Billing and Subscription 💰',
	],
]

tasks.forEach((col, idx) => {
	if (columns[idx]) {
		for (const item of col) {
			const tasksContainer = columns[idx].querySelector('.tasks')
			if (tasksContainer) {
				tasksContainer.appendChild(createTask(item))
			}
		}
	} else {
		console.warn(`Data in ${idx} true, aber HTML no.`)
	}
})
