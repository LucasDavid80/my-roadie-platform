interface SelectionTagProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

export function SelectionTag({ label, isSelected, onClick }: SelectionTagProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
        >
            {label}
        </button>
    );
}