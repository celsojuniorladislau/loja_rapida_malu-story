'use client';

interface ColorOption {
    id: string;
    name: string;
    hexColor: string;
}

interface ColorSelectorProps {
    colors: ColorOption[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function ColorSelector({colors, selectedId, onSelect}: ColorSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
                <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={selectedId === color.id}
                    onClick={() => onSelect(color.id)}
                    className={[
                        'w-6 h-6 rounded-full transition-all duration-150 ease-in-out',
                        selectedId === color.id
                            ? 'ring-2 ring-green-600 ring-offset-2'
                            : 'hover:ring-1 hover:ring-grey-300',
                    ].join(' ')}
                    style={{backgroundColor: color.hexColor}}
                />
            ))}
        </div>
    );
}
