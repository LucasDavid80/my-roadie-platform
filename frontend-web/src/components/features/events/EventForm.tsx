import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { EventStatus } from '@/types/event';

const eventSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    startsAt: z.string().min(1, 'Data e Hora de início são obrigatórias'),
    endsAt: z.string().optional(),
    timezone: z.string().default('America/Sao_Paulo'),
    location: z.string().min(1, 'Local é obrigatório'),
    fee: z.number().optional(),
    description: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
    initialData?: Partial<EventFormValues>;
    onSubmit: (data: EventFormValues) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function EventForm({ initialData, onSubmit, onCancel, isLoading }: EventFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: initialData?.title || '',
            type: initialData?.type || 'Show',
            startsAt: initialData?.startsAt || '',
            endsAt: initialData?.endsAt || '',
            timezone: initialData?.timezone || 'America/Sao_Paulo',
            location: initialData?.location || '',
            fee: initialData?.fee || undefined,
            description: initialData?.description || '',
        },
    });

    const type = watch('type');
    const showsFee = type === 'Show' || type === 'Gravação';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
                {initialData ? 'Editar Compromisso' : 'Novo Compromisso'}
            </h2>

            <Input
                label="Título"
                placeholder="Ex: Pagode na Adega"
                {...register('title')}
                error={errors.title?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-700">Tipo</label>
                    <select
                        {...register('type')}
                        className={`px-4 py-3 rounded-xl border transition-all outline-none border-slate-200 focus:border-orange-500 bg-slate-50 focus:bg-white`}
                    >
                        <option value="Show">Show</option>
                        <option value="Ensaio">Ensaio</option>
                        <option value="Gravação">Gravação</option>
                        <option value="Reunião">Reunião</option>
                    </select>
                    {errors.type && <span className="text-xs text-red-500 font-medium">{errors.type.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-700">Fuso Horário</label>
                    <select
                        {...register('timezone')}
                        className="px-4 py-3 rounded-xl border transition-all outline-none border-slate-200 focus:border-orange-500 bg-slate-50 focus:bg-white"
                    >
                        <option value="America/Sao_Paulo">Horário de Brasília (America/Sao_Paulo)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Data e Hora de Início *"
                    type="datetime-local"
                    {...register('startsAt')}
                    error={errors.startsAt?.message}
                />
                <Input
                    label="Data e Hora de Fim (Opcional)"
                    type="datetime-local"
                    {...register('endsAt')}
                    error={errors.endsAt?.message}
                />
            </div>

            <Input
                label="Local"
                placeholder="Endereço..."
                {...register('location')}
                error={errors.location?.message}
            />

            {showsFee && (
                <Input
                    label="Cachê (R$)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('fee', { valueAsNumber: true })}
                    error={errors.fee?.message}
                />
            )}

            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700">Observações</label>
                <textarea
                    {...register('description')}
                    placeholder="Anotações, setlist..."
                    rows={4}
                    className="px-4 py-3 rounded-xl border transition-all outline-none border-slate-200 focus:border-orange-500 bg-slate-50 focus:bg-white resize-none"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Compromisso')}
                </button>
            </div>
        </form>
    );
}
