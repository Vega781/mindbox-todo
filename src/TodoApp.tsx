import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Trash2, Plus, Check, Circle } from 'lucide-react';
import styles from './style.module.scss';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';

const STORAGE_KEYS = {
    TODOS: 'mindbox-todos',
    FILTER: 'mindbox-filter'
} as const;

interface StoredTodo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: string;
}

const loadTodosFromStorage = (): Todo[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.TODOS);
        if (stored) {
            const parsed: StoredTodo[] = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed.map((todo: StoredTodo) => ({
                    ...todo,
                    createdAt: new Date(todo.createdAt)
                }));
            }
        }
    } catch (error) {
        console.error('Error loading todos from localStorage:', error);
    }
    return [];
};

const saveTodosToStorage = (todos: Todo[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
        console.error('Error saving todos to localStorage:', error);
    }
};

const loadFilterFromStorage = (): FilterType => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.FILTER);
        if (stored && ['all', 'active', 'completed'].includes(stored)) {
            return stored as FilterType;
        }
    } catch (error) {
        console.error('Error loading filter from localStorage:', error);
    }
    return 'all';
};

const saveFilterToStorage = (filter: FilterType): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.FILTER, filter);
    } catch (error) {
        console.error('Error saving filter to localStorage:', error);
    }
};

const TodoApp: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>(() => loadTodosFromStorage());
    const [inputValue, setInputValue] = useState<string>('');
    const [filter, setFilter] = useState<FilterType>(() => loadFilterFromStorage());

    useEffect(() => {
        saveTodosToStorage(todos);
    }, [todos]);

    useEffect(() => {
        saveFilterToStorage(filter);
    }, [filter]);

    const addTodo = useCallback(() => {
        if (inputValue.trim()) {
            const newTodo: Todo = {
                id: Date.now(),
                text: inputValue.trim(),
                completed: false,
                createdAt: new Date()
            };
            setTodos(prev => [...prev, newTodo]);
            setInputValue('');
        }
    }, [inputValue]);

    const toggleTodo = useCallback((id: number) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    }, []);

    const deleteTodo = useCallback((id: number) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    }, []);

    const clearCompleted = useCallback(() => {
        setTodos(prev => prev.filter(todo => !todo.completed));
    }, []);

    const filteredTodos = useMemo(() => {
        switch (filter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            default:
                return todos;
        }
    }, [todos, filter]);

    const activeTodosCount = useMemo(() =>
        todos.filter(todo => !todo.completed).length, [todos]
    );

    const completedTodosCount = useMemo(() =>
        todos.filter(todo => todo.completed).length, [todos]
    );

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <h1 className={styles.title}>
                    Mindbox ToDo
                </h1>

                <div className={styles.card}>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Добавить новую задачу..."
                            className={styles.input}
                            data-testid="todo-input"
                        />
                        <button
                            onClick={addTodo}
                            className={styles.addButton}
                            data-testid="add-button"
                        >
                            <Plus size={20} />
                            Добавить
                        </button>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.filterContainer}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
                            data-testid="filter-all"
                        >
                            Все задачи ({todos.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`${styles.filterButton} ${filter === 'active' ? styles.filterActive : ''}`}
                            data-testid="filter-active"
                        >
                            Невыполненные ({activeTodosCount})
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`${styles.filterButton} ${filter === 'completed' ? styles.filterActive : ''}`}
                            data-testid="filter-completed"
                        >
                            Выполненные ({completedTodosCount})
                        </button>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.statsContainer}>
                        <div className={styles.statsText}>
                            Осталось задач: <span className={styles.statsNumber}>{activeTodosCount}</span>
                        </div>
                        {completedTodosCount > 0 && (
                            <button
                                onClick={clearCompleted}
                                className={styles.clearButton}
                                data-testid="clear-completed"
                            >
                                <Trash2 size={16} />
                                Очистить выполненные
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    {filteredTodos.length === 0 ? (
                        <div className={styles.emptyState}>
                            {filter === 'active' && 'Нет невыполненных задач'}
                            {filter === 'completed' && 'Нет выполненных задач'}
                            {filter === 'all' && 'Список задач пуст'}
                        </div>
                    ) : (
                        <div className={styles.todoList}>
                            {filteredTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={styles.todoItem}
                                    data-testid="todo-item"
                                >
                                    <button
                                        onClick={() => toggleTodo(todo.id)}
                                        className={`${styles.toggleButton} ${todo.completed ? styles.toggleCompleted : ''}`}
                                        data-testid="toggle-todo"
                                    >
                                        {todo.completed ? <Check size={20} /> : <Circle size={20} />}
                                    </button>
                                    <span
                                        className={`${styles.todoText} ${todo.completed ? styles.todoTextCompleted : ''}`}
                                    >
                                        {todo.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className={styles.deleteButton}
                                        data-testid="delete-todo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoApp;