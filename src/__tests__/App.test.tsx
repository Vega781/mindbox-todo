import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoApp from '../TodoApp';

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};

global.localStorage = localStorageMock;

describe('TodoApp', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockReturnValue(null);
        localStorageMock.setItem.mockClear();
    });

    it('отображает заголовок и пустое состояние', () => {
        render(<TodoApp />);

        expect(screen.getByText('Mindbox ToDo')).toBeInTheDocument();
        expect(screen.getByText('Список задач пуст')).toBeInTheDocument();
    });

    it('добавляет новую задачу', () => {
        render(<TodoApp />);

        const input = screen.getByTestId('todo-input');
        const addButton = screen.getByTestId('add-button');

        fireEvent.change(input, { target: { value: 'Новая задача' } });
        fireEvent.click(addButton);

        expect(screen.getByText('Новая задача')).toBeInTheDocument();
        expect((input as HTMLInputElement).value).toBe('');
    });

    it('переключает состояние задачи', () => {
        render(<TodoApp />);

        const input = screen.getByTestId('todo-input');
        fireEvent.change(input, { target: { value: 'Тестовая задача' } });
        fireEvent.click(screen.getByTestId('add-button'));

        const toggleButton = screen.getByTestId('toggle-todo');
        fireEvent.click(toggleButton);

        expect(screen.getByText('Выполненные (1)')).toBeInTheDocument();
        expect(screen.getByText('Невыполненные (0)')).toBeInTheDocument();
    });

    it('удаляет задачу', () => {
        render(<TodoApp />);

        const input = screen.getByTestId('todo-input');
        fireEvent.change(input, { target: { value: 'Удаляемая задача' } });
        fireEvent.click(screen.getByTestId('add-button'));

        const deleteButton = screen.getByTestId('delete-todo');
        fireEvent.click(deleteButton);

        expect(screen.queryByText('Удаляемая задача')).not.toBeInTheDocument();
        expect(screen.getByText('Список задач пуст')).toBeInTheDocument();
    });

    it('фильтрует задачи по статусу', () => {
        render(<TodoApp />);

        const input = screen.getByTestId('todo-input');

        fireEvent.change(input, { target: { value: 'Активная задача' } });
        fireEvent.click(screen.getByTestId('add-button'));

        fireEvent.change(input, { target: { value: 'Выполненная задача' } });
        fireEvent.click(screen.getByTestId('add-button'));

        const toggleButtons = screen.getAllByTestId('toggle-todo');
        fireEvent.click(toggleButtons[1]);

        fireEvent.click(screen.getByTestId('filter-active'));
        expect(screen.getByText('Активная задача')).toBeInTheDocument();
        expect(screen.queryByText('Выполненная задача')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('filter-completed'));
        expect(screen.queryByText('Активная задача')).not.toBeInTheDocument();
        expect(screen.getByText('Выполненная задача')).toBeInTheDocument();
    });

    it('очищает выполненные задачи', () => {
        render(<TodoApp />);

        const input = screen.getByTestId('todo-input');
        fireEvent.change(input, { target: { value: 'Задача для очистки' } });
        fireEvent.click(screen.getByTestId('add-button'));

        const toggleButton = screen.getByTestId('toggle-todo');
        fireEvent.click(toggleButton);

        const clearButton = screen.getByTestId('clear-completed');
        fireEvent.click(clearButton);

        expect(screen.queryByText('Задача для очистки')).not.toBeInTheDocument();
        expect(screen.getByText('Список задач пуст')).toBeInTheDocument();
    });

    it('не добавляет пустые задачи', () => {
        render(<TodoApp />);

        const addButton = screen.getByTestId('add-button');
        fireEvent.click(addButton);

        expect(screen.getByText('Список задач пуст')).toBeInTheDocument();

        const input = screen.getByTestId('todo-input');
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.click(addButton);

        expect(screen.getByText('Список задач пуст')).toBeInTheDocument();
    });
});