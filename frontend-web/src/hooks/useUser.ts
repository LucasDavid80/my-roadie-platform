import { useState } from 'react';
import { UserEntity } from '../types/user';

export function useUser(initialUser: UserEntity) {
    const [user, setUser] = useState<UserEntity>(initialUser);

    // Funções de atualização (Substituem os void update... do Dart)
    const updateField = (field: keyof UserEntity, value: any) => {
        setUser((prev) => ({ ...prev, [field]: value }));
    };

    const toggleListItem = (field: 'instruments' | 'styles', item: string) => {
        setUser((prev) => {
            const currentList = [...(prev[field] as string[])];
            const index = currentList.indexOf(item);

            if (index > -1) {
                currentList.splice(index, 1); // Remove se já existe
            } else {
                currentList.push(item); // Adiciona se não existe
            }

            return { ...prev, [field]: currentList };
        });
    };

    return {
        user,
        // Métodos expostos para os inputs do Front
        updateName: (val: string) => updateField('name', val),
        updateExperience: (val: string) => updateField('experience', val),
        updatePhone: (val: string) => updateField('phone', val),
        updateInstagram: (val: string) => updateField('instagram', val),
        updateCity: (val: string) => updateField('city', val),
        updateFederativeUnit: (val: string) => updateField('federativeUnit', val),
        updateVideoLink: (val: string) => updateField('youtubeLink', val),
        updateBio: (val: string) => updateField('bio', val),
        updateMinimumFee: (val: number) => updateField('minCache', val),
        updateAvailability: (val: boolean) => updateField('isAvailable', val),
        toggleInstrument: (item: string) => toggleListItem('instruments', item),
        toggleStyle: (item: string) => toggleListItem('styles', item),
    };
}