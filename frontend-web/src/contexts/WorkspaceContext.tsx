'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { bandService } from '@/services/band-service';
import { BandEntity } from '@/types/band';
import { useAuth } from './AuthContext';

const ACTIVE_BAND_STORAGE_KEY = '@MyRoadie:activeBandId';

interface WorkspaceContextData {
    bands: BandEntity[];
    activeBandId: string | null;
    activeBand: BandEntity | null;
    isLoading: boolean;
    error: string | null;
    selectBand: (bandId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextData | undefined>(undefined);

export function WorkspaceProvider({ children }: Readonly<{ children: ReactNode }>) {
    const { isAuthenticated } = useAuth();
    const [bands, setBands] = useState<BandEntity[]>([]);
    const [activeBandId, setActiveBandId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setBands([]);
            setActiveBandId(null);
            setError(null);
            return;
        }

        let isMounted = true;

        async function loadBands() {
            setIsLoading(true);
            setError(null);

            try {
                const availableBands = await bandService.getAll();
                if (!isMounted) return;

                const storedBandId = sessionStorage.getItem(ACTIVE_BAND_STORAGE_KEY);
                const nextActiveBandId =
                    availableBands.find((band) => band.id === storedBandId)?.id ??
                    availableBands[0]?.id ??
                    null;

                setBands(availableBands);
                setActiveBandId(nextActiveBandId);

                if (nextActiveBandId) {
                    sessionStorage.setItem(ACTIVE_BAND_STORAGE_KEY, nextActiveBandId);
                } else {
                    sessionStorage.removeItem(ACTIVE_BAND_STORAGE_KEY);
                }
            } catch {
                if (isMounted) {
                    setError('Não foi possível carregar suas bandas.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadBands();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    const selectBand = useCallback((bandId: string) => {
        if (!bands.some((band) => band.id === bandId)) {
            return;
        }

        setActiveBandId(bandId);
        sessionStorage.setItem(ACTIVE_BAND_STORAGE_KEY, bandId);
    }, [bands]);

    const activeBand = bands.find((band) => band.id === activeBandId) ?? null;

    return (
        <WorkspaceContext.Provider
            value={{ bands, activeBandId, activeBand, isLoading, error, selectBand }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);

    if (!context) {
        throw new Error('useWorkspace deve ser usado dentro de WorkspaceProvider');
    }

    return context;
}
