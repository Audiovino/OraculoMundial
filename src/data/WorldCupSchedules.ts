export interface MatchSchedule {
    id: string;
    title: string;
    score?: string;
    date: string;
    venue: string;
    times: {
        arg: string;
        uru: string;
        par: string;
        chi: string;
        col: string;
        mex: string;
        usa: string;
        esp: string;
        stars?: {
            arg?: boolean;
            uru?: boolean;
            par?: boolean;
            chi?: boolean;
            col?: boolean;
            mex?: boolean;
            usa?: boolean;
            esp?: boolean;
        };
        nextDay?: {
            usa?: boolean;
            esp?: boolean;
            arg?: boolean;
            // etc based on logic, but string annotation in user request "(12)" implies next day date
        }
    };
    note?: string;
}

export interface ScheduleGroup {
    id: string;
    name: string;
    highlight?: string; // e.g., "⭐ ARGENTINA ⭐"
    matches: MatchSchedule[];
}

export const TIMEZONE_INFO = [
    { id: 'arg', country: '🇦🇷 Argentina', zone: 'ART', gmt: 'GMT-3', diff: 'Referencia' },
    { id: 'uru', country: '🇺🇾 Uruguay', zone: 'UYT', gmt: 'GMT-3', diff: '= Argentina' },
    { id: 'par', country: '🇵🇾 Paraguay', zone: 'PYT', gmt: 'GMT-4', diff: '-1 hora' },
    { id: 'chi', country: '🇨🇱 Chile', zone: 'CLT', gmt: 'GMT-4', diff: '-1 hora' },
    { id: 'col', country: '🇨🇴 Colombia', zone: 'COT', gmt: 'GMT-5', diff: '-2 horas' },
    { id: 'mex', country: '🇲🇽 México', zone: 'CDT', gmt: 'GMT-6', diff: '-3 horas' },
    { id: 'usa', country: '🇺🇸 USA Este', zone: 'EDT', gmt: 'GMT-4', diff: '-1 hora' },
    { id: 'esp', country: '🇪🇸 España', zone: 'CEST', gmt: 'GMT+2', diff: '+5 horas' },
];

export const WORLD_CUP_SCHEDULES: ScheduleGroup[] = [
    {
        id: 'group_a',
        name: 'GRUPO A - HORARIOS COMPLETOS',
        matches: [
            {
                id: 'ga_m1',
                title: 'PARTIDO 1: México 2-1 Sudáfrica',
                score: '2-1',
                date: '11 junio',
                venue: '📍 CDMX',
                times: { arg: '00:00 (12)', uru: '00:00 (12)', par: '23:00', chi: '23:00', col: '22:00', mex: '21:00', usa: '23:00', esp: '05:00 (12)', stars: { mex: true } }
            },
            {
                id: 'ga_m2',
                title: 'PARTIDO 2: Corea 2-1 Ucrania',
                score: '2-1',
                date: '11 junio',
                venue: '📍 Guadalajara',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '18:00', usa: '20:00', esp: '02:00 (12)', stars: { mex: true } }
            },
            {
                id: 'ga_m3',
                title: 'PARTIDO 3: Ucrania 1-1 Sudáfrica',
                score: '1-1',
                date: '18 junio',
                venue: '📍 Atlanta',
                times: { arg: '20:00', uru: '20:00', par: '19:00', chi: '19:00', col: '18:00', mex: '18:00', usa: '19:00', esp: '01:00 (19)', stars: { par: true, chi: true, usa: true } }
            },
            {
                id: 'ga_m4',
                title: 'PARTIDO 4: México 1-1 Corea',
                score: '1-1',
                date: '18 junio',
                venue: '📍 Guadalajara',
                times: { arg: '00:00 (19)', uru: '00:00 (19)', par: '23:00', chi: '23:00', col: '22:00', mex: '21:00', usa: '23:00', esp: '05:00 (19)', stars: { mex: true } }
            },
            {
                id: 'ga_m5',
                title: 'PARTIDO 5: Ucrania 0-2 México',
                score: '0-2',
                date: '24 junio',
                venue: '📍 CDMX',
                times: { arg: '00:00 (25)', uru: '00:00 (25)', par: '23:00', chi: '23:00', col: '22:00', mex: '21:00', usa: '23:00', esp: '05:00 (25)', stars: { mex: true } }
            },
            {
                id: 'ga_m6',
                title: 'PARTIDO 6: Sudáfrica 1-3 Corea',
                score: '1-3',
                date: '24 junio',
                venue: '📍 Monterrey',
                times: { arg: '23:00', uru: '23:00', par: '22:00', chi: '22:00', col: '21:00', mex: '20:00', usa: '22:00', esp: '04:00 (25)', stars: { mex: true } }
            }
        ]
    },
    {
        id: 'group_j',
        name: 'GRUPO J',
        highlight: '⭐ ARGENTINA ⭐',
        matches: [
            {
                id: 'gj_m1',
                title: 'PARTIDO 1: 🇦🇷 Argentina 3-0 Argelia',
                score: '3-0',
                date: '16 junio',
                venue: '📍 Kansas City',
                times: { arg: '22:00', uru: '22:00', par: '21:00', chi: '21:00', col: '20:00', mex: '20:00', usa: '20:00', esp: '04:00 (17)', stars: { arg: true } },
                note: '🎯 HORARIO PERFECTO PARA ARGENTINA - DOMINGO A LA NOCHE'
            },
            {
                id: 'gj_m2',
                title: 'PARTIDO 2: Austria 2-0 Jordania',
                score: '2-0',
                date: '16 junio',
                venue: '📍 San Francisco',
                times: { arg: '00:00 (17)', uru: '00:00 (17)', par: '23:00', chi: '23:00', col: '21:00', mex: '20:00', usa: '18:00', esp: '04:00 (17)' }
            },
            {
                id: 'gj_m3',
                title: 'PARTIDO 3: 🇦🇷 Argentina 2-0 Austria',
                score: '2-0',
                date: '22 junio',
                venue: '📍 Dallas',
                times: { arg: '20:00', uru: '20:00', par: '19:00', chi: '19:00', col: '18:00', mex: '18:00', usa: '18:00', esp: '02:00 (23)', stars: { arg: true, par: true, chi: true } },
                note: '🎯 DOMINGO A LA NOCHE - HORARIO IDEAL SUDAMÉRICA'
            },
            {
                id: 'gj_m4',
                title: 'PARTIDO 4: Jordania 1-1 Argelia',
                score: '1-1',
                date: '22 junio',
                venue: '📍 San Francisco',
                times: { arg: '00:00 (23)', uru: '00:00 (23)', par: '23:00', chi: '23:00', col: '21:00', mex: '20:00', usa: '18:00', esp: '04:00 (23)' }
            },
            {
                id: 'gj_m5',
                title: 'PARTIDO 5: Jordania 1-4 🇦🇷 Argentina',
                score: '1-4',
                date: '27 junio',
                venue: '📍 Kansas City',
                times: { arg: '17:00', uru: '17:00', par: '16:00', chi: '16:00', col: '15:00', mex: '15:00', usa: '15:00', esp: '23:00', stars: { arg: true, par: true, chi: true } },
                note: '🎯 VIERNES TARDE - TEMPRANO PERO ACCESIBLE'
            },
            {
                id: 'gj_m6',
                title: 'PARTIDO 6: Argelia 1-2 Austria',
                score: '1-2',
                date: '27 junio',
                venue: '📍 Dallas',
                times: { arg: '20:00', uru: '20:00', par: '19:00', chi: '19:00', col: '18:00', mex: '18:00', usa: '18:00', esp: '02:00 (28)' }
            }
        ]
    },
    {
        id: 'group_h',
        name: 'GRUPO H - Uruguay y España',
        matches: [
            {
                id: 'gh_m1',
                title: 'PARTIDO 1: España 4-0 Cabo Verde',
                score: '4-0',
                date: '15 junio',
                venue: '📍 Miami',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '19:00', usa: '20:00', esp: '02:00 (16)' }
            },
            {
                id: 'gh_m2',
                title: 'PARTIDO 2: Arabia 1-3 🇺🇾 Uruguay',
                score: '1-3',
                date: '15 junio',
                venue: '📍 Atlanta',
                times: { arg: '18:00', uru: '18:00', par: '17:00', chi: '17:00', col: '16:00', mex: '16:00', usa: '17:00', esp: '23:00', stars: { uru: true } },
                note: '🎯 HORARIO IDEAL PARA URUGUAY - SÁBADO TARDE'
            },
            {
                id: 'gh_m3',
                title: 'PARTIDO 3: España 3-0 Arabia',
                score: '3-0',
                date: '21 junio',
                venue: '📍 Miami',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '19:00', usa: '20:00', esp: '02:00 (22)' }
            },
            {
                id: 'gh_m4',
                title: 'PARTIDO 4: Cabo Verde 0-2 🇺🇾 Uruguay',
                score: '0-2',
                date: '21 junio',
                venue: '📍 Atlanta',
                times: { arg: '18:00', uru: '18:00', par: '17:00', chi: '17:00', col: '16:00', mex: '16:00', usa: '17:00', esp: '23:00', stars: { uru: true } }
            },
            {
                id: 'gh_m5',
                title: 'PARTIDO 5: 🇺🇾 Uruguay 1-1 España 🇪🇸',
                score: '1-1',
                date: '26 junio',
                venue: '📍 Houston',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '19:00', usa: '19:00', esp: '03:00 (27)', stars: { par: true } },
                note: '🎯 JUEVES NOCHE - CLÁSICO SUDAMERICANO'
            },
            {
                id: 'gh_m6',
                title: 'PARTIDO 6: Cabo Verde 2-1 Arabia',
                score: '2-1',
                date: '26 junio',
                venue: '📍 Guadalajara',
                times: { arg: '20:00', uru: '20:00', par: '19:00', chi: '19:00', col: '18:00', mex: '18:00', usa: '20:00', esp: '02:00 (27)', stars: { usa: true } }
            }
        ]
    },
    {
        id: 'group_k',
        name: 'GRUPO K - Colombia y Paraguay (Rivales directos)',
        matches: [
            {
                id: 'gk_m1',
                title: 'PARTIDO 1: Portugal 3-0 Costa Rica',
                score: '3-0',
                date: '17 junio',
                venue: '📍 Houston',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '19:00', usa: '19:00', esp: '03:00 (18)', stars: { usa: true } }
            },
            {
                id: 'gk_m2',
                title: 'PARTIDO 2: Uzbekistán 0-2 🇨🇴 Colombia',
                score: '0-2',
                date: '17 junio',
                venue: '📍 CDMX',
                times: { arg: '00:00 (18)', uru: '00:00 (18)', par: '23:00', chi: '23:00', col: '22:00', mex: '21:00', usa: '23:00', esp: '05:00 (18)', stars: { col: true, mex: true } },
                note: '🎯 HORARIO PERFECTO PARA COLOMBIA - LUNES NOCHE'
            },
            {
                id: 'gk_m3',
                title: 'PARTIDO 3: Portugal 4-1 Uzbekistán',
                score: '4-1',
                date: '23 junio',
                venue: '📍 Houston',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '19:00', usa: '19:00', esp: '03:00 (24)', stars: { usa: true } }
            },
            {
                id: 'gk_m4',
                title: 'PARTIDO 4: Costa Rica 1-1 🇨🇴 Colombia',
                score: '1-1',
                date: '23 junio',
                venue: '📍 Guadalajara',
                times: { arg: '20:00', uru: '20:00', par: '19:00', chi: '19:00', col: '18:00', mex: '18:00', usa: '20:00', esp: '02:00 (24)', stars: { col: true, mex: true } }
            },
            {
                id: 'gk_m5',
                title: 'PARTIDO 5: 🇨🇴 Colombia 1-2 Portugal',
                score: '1-2',
                date: '27 junio',
                venue: '📍 Miami',
                times: { arg: '21:00', uru: '21:00', par: '20:00', chi: '20:00', col: '19:00', mex: '19:00', usa: '20:00', esp: '02:00 (28)', stars: { col: true } }
            },
            {
                id: 'gk_m6',
                title: 'PARTIDO 6: Costa Rica 2-0 Uzbekistán',
                score: '2-0',
                date: '27 junio',
                venue: '📍 Atlanta',
                times: { arg: '18:00', uru: '18:00', par: '17:00', chi: '17:00', col: '16:00', mex: '16:00', usa: '17:00', esp: '23:00' }
            }
        ]
    }
];
