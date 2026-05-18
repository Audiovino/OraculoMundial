export const ASTRO_PREDICTIONS = [
    {
        id: 'group_a',
        title: '📅 GRUPO A',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '11 Jun', match: '🇲🇽 México vs Sudáfrica 🇿🇦', result: 'GANA MÉXICO' },
            { date: '11 Jun', match: '🇰🇷 Corea del Sur vs Ucrania 🇺🇦', result: 'GANA COREA DEL SUR' },
            { date: '18 Jun', match: '🇺🇦 Ucrania vs Sudáfrica 🇿🇦', result: 'EMPATE' },
            { date: '18 Jun', match: '🇲🇽 México vs Corea del Sur 🇰🇷', result: 'EMPATE' },
            { date: '24 Jun', match: '🇺🇦 Ucrania vs México 🇲🇽', result: 'GANA MÉXICO' },
            { date: '24 Jun', match: '🇿🇦 Sudáfrica vs Corea del Sur 🇰🇷', result: 'GANA COREA DEL SUR' }
        ],
        classified: '🇲🇽 México | 🇰🇷 Corea del Sur'
    },
    {
        id: 'group_b',
        title: '📅 GRUPO B',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '12 Jun', match: '🇨🇦 Canadá vs Polonia 🇵🇱', result: 'GANA CANADÁ' },
            { date: '13 Jun', match: '🇶🇦 Qatar vs Suiza 🇨🇭', result: 'GANA SUIZA' },
            { date: '18 Jun', match: '🇨🇭 Suiza vs Polonia 🇵🇱', result: 'GANA SUIZA' },
            { date: '18 Jun', match: '🇨🇦 Canadá vs Qatar 🇶🇦', result: 'GANA CANADÁ' },
            { date: '24 Jun', match: '🇨🇭 Suiza vs Canadá 🇨🇦', result: 'EMPATE' },
            { date: '24 Jun', match: '🇵🇱 Polonia vs Qatar 🇶🇦', result: 'GANA POLONIA' }
        ],
        classified: '🇨🇦 Canadá | 🇨🇭 Suiza'
    },
    {
        id: 'group_c',
        title: '📅 GRUPO C',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '13 Jun', match: '🇧🇷 Brasil vs Marruecos 🇲🇦', result: 'GANA BRASIL' },
            { date: '13 Jun', match: '🇭🇹 Haití vs Escocia 🏴', result: 'GANA ESCOCIA' },
            { date: '19 Jun', match: '🇧🇷 Brasil vs Haití 🇭🇹', result: 'GANA BRASIL' },
            { date: '19 Jun', match: '🏴 Escocia vs Marruecos 🇲🇦', result: 'GANA MARRUECOS' },
            { date: '24 Jun', match: '🏴 Escocia vs Brasil 🇧🇷', result: 'GANA BRASIL' },
            { date: '24 Jun', match: '🇲🇦 Marruecos vs Haití 🇭🇹', result: 'GANA MARRUECOS' }
        ],
        classified: '🇧🇷 Brasil | 🇲🇦 Marruecos'
    },
    {
        id: 'group_d',
        title: '📅 GRUPO D',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '12 Jun', match: '🇺🇸 USA vs Italia 🇮🇹', result: 'EMPATE' },
            { date: '13 Jun', match: '🇦🇺 Australia vs Paraguay 🇵🇾', result: 'GANA PARAGUAY' },
            { date: '19 Jun', match: '🇮🇹 Italia vs Paraguay 🇵🇾', result: 'GANA ITALIA' },
            { date: '19 Jun', match: '🇺🇸 USA vs Australia 🇦🇺', result: 'GANA USA' },
            { date: '25 Jun', match: '🇮🇹 Italia vs USA 🇺🇸', result: 'EMPATE' },
            { date: '25 Jun', match: '🇵🇾 Paraguay vs Australia 🇦🇺', result: 'GANA PARAGUAY' }
        ],
        classified: '🇺🇸 USA | 🇮🇹 Italia'
    },
    {
        id: 'group_e',
        title: '📅 GRUPO E',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '14 Jun', match: '🇩🇪 Alemania vs Curazao 🇨🇼', result: 'GANA ALEMANIA' },
            { date: '14 Jun', match: '🇨🇮 Costa de Marfil vs Ecuador 🇪🇨', result: 'EMPATE' },
            { date: '20 Jun', match: '🇩🇪 Alemania vs Costa de Marfil 🇨🇮', result: 'GANA ALEMANIA' },
            { date: '20 Jun', match: '🇨🇼 Curazao vs Ecuador 🇪🇨', result: 'GANA ECUADOR' },
            { date: '25 Jun', match: '🇪🇨 Ecuador vs Alemania 🇩🇪', result: 'GANA ALEMANIA' },
            { date: '25 Jun', match: '🇨🇼 Curazao vs Costa de Marfil 🇨🇮', result: 'EMPATE' }
        ],
        classified: '🇩🇪 Alemania | 🇪🇨 Ecuador'
    },
    {
        id: 'group_f',
        title: '📅 GRUPO F',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '14 Jun', match: '🇳🇱 Países Bajos vs Japón 🇯🇵', result: 'GANA PAÍSES BAJOS' },
            { date: '14 Jun', match: '🇸🇪 Suecia vs Túnez 🇹🇳', result: 'GANA SUECIA' },
            { date: '20 Jun', match: '🇳🇱 Países Bajos vs Suecia 🇸🇪', result: 'EMPATE' },
            { date: '20 Jun', match: '🇯🇵 Japón vs Túnez 🇹🇳', result: 'GANA JAPÓN' },
            { date: '25 Jun', match: '🇹🇳 Túnez vs Países Bajos 🇳🇱', result: 'GANA PAÍSES BAJOS' },
            { date: '25 Jun', match: '🇯🇵 Japón vs Suecia 🇸🇪', result: 'EMPATE' }
        ],
        classified: '🇳🇱 Países Bajos | 🇸🇪 Suecia'
    },
    {
        id: 'group_g',
        title: '📅 GRUPO G',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '15 Jun', match: '🇧🇪 Bélgica vs Egipto 🇪🇬', result: 'GANA BÉLGICA' },
            { date: '15 Jun', match: '🇮🇷 Irán vs Nueva Zelanda 🇳🇿', result: 'EMPATE' },
            { date: '21 Jun', match: '🇧🇪 Bélgica vs Irán 🇮🇷', result: 'GANA BÉLGICA' },
            { date: '21 Jun', match: '🇪🇬 Egipto vs Nueva Zelanda 🇳🇿', result: 'GANA EGIPTO' },
            { date: '26 Jun', match: '🇳🇿 Nueva Zelanda vs Bélgica 🇧🇪', result: 'GANA BÉLGICA' },
            { date: '26 Jun', match: '🇪🇬 Egipto vs Irán 🇮🇷', result: 'EMPATE' }
        ],
        classified: '🇧🇪 Bélgica | 🇪🇬 Egipto'
    },
    {
        id: 'group_h',
        title: '📅 GRUPO H',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '15 Jun', match: '🇪🇸 España vs Cabo Verde 🇨🇻', result: 'GANA ESPAÑA' },
            { date: '15 Jun', match: '🇸🇦 Arabia Saudita vs Uruguay 🇺🇾', result: 'GANA URUGUAY' },
            { date: '21 Jun', match: '🇪🇸 España vs Arabia Saudita 🇸🇦', result: 'GANA ESPAÑA' },
            { date: '21 Jun', match: '🇨🇻 Cabo Verde vs Uruguay 🇺🇾', result: 'GANA URUGUAY' },
            { date: '26 Jun', match: '🇺🇾 Uruguay vs España 🇪🇸', result: 'EMPATE' },
            { date: '26 Jun', match: '🇨🇻 Cabo Verde vs Arabia Saudita 🇸🇦', result: 'GANA CABO VERDE' }
        ],
        classified: '🇪🇸 España | 🇺🇾 Uruguay'
    },
    {
        id: 'group_i',
        title: '📅 GRUPO I',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '16 Jun', match: '🇫🇷 Francia vs Senegal 🇸🇳', result: 'GANA FRANCIA' },
            { date: '16 Jun', match: '🇵🇪 Perú vs Noruega 🇳🇴', result: 'GANA NORUEGA' },
            { date: '22 Jun', match: '🇫🇷 Francia vs Perú 🇵🇪', result: 'GANA FRANCIA' },
            { date: '22 Jun', match: '🇳🇴 Noruega vs Senegal 🇸🇳', result: 'EMPATE' },
            { date: '26 Jun', match: '🇳🇴 Noruega vs Francia 🇫🇷', result: 'GANA FRANCIA' },
            { date: '26 Jun', match: '🇸🇳 Senegal vs Perú 🇵🇪', result: 'GANA SENEGAL' }
        ],
        classified: '🇫🇷 Francia | 🇸🇳 Senegal'
    },
    {
        id: 'group_j',
        title: '📅 GRUPO J ⭐',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '16 Jun', match: '🇦🇷 ARGENTINA vs Argelia 🇩🇿', result: 'GANA ARGENTINA ⭐' },
            { date: '16 Jun', match: '🇦🇹 Austria vs Jordania 🇯🇴', result: 'GANA AUSTRIA' },
            { date: '22 Jun', match: '🇦🇷 ARGENTINA vs Austria 🇦🇹', result: 'GANA ARGENTINA ⭐' },
            { date: '22 Jun', match: '🇯🇴 Jordania vs Argelia 🇩🇿', result: 'EMPATE' },
            { date: '27 Jun', match: '🇯🇴 Jordania vs ARGENTINA 🇦🇷', result: 'GANA ARGENTINA ⭐' },
            { date: '27 Jun', match: '🇩🇿 Argelia vs Austria 🇦🇹', result: 'GANA AUSTRIA' }
        ],
        classified: '🇦🇷 ARGENTINA (9 pts - PERFECTO) | 🇦🇹 Austria'
    },
    {
        id: 'group_k',
        title: '📅 GRUPO K',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '17 Jun', match: '🇵🇹 Portugal vs Costa Rica 🇨🇷', result: 'GANA PORTUGAL' },
            { date: '17 Jun', match: '🇺🇿 Uzbekistán vs Colombia 🇨🇴', result: 'GANA COLOMBIA' },
            { date: '23 Jun', match: '🇵🇹 Portugal vs Uzbekistán 🇺🇿', result: 'GANA PORTUGAL' },
            { date: '23 Jun', match: '🇨🇷 Costa Rica vs Colombia 🇨🇴', result: 'EMPATE' },
            { date: '27 Jun', match: '🇨🇴 Colombia vs Portugal 🇵🇹', result: 'GANA PORTUGAL' },
            { date: '27 Jun', match: '🇨🇷 Costa Rica vs Uzbekistán 🇺🇿', result: 'GANA COSTA RICA' }
        ],
        classified: '🇵🇹 Portugal | 🇨🇴 Colombia'
    },
    {
        id: 'group_l',
        title: '📅 GRUPO L',
        type: 'group',
        headers: ['Fecha', 'Partido', 'Resultado'],
        matches: [
            { date: '17 Jun', match: '🏴 Inglaterra vs Croacia 🇭🇷', result: 'GANA INGLATERRA' },
            { date: '17 Jun', match: '🇬🇭 Ghana vs Panamá 🇵🇦', result: 'GANA GHANA' },
            { date: '23 Jun', match: '🏴 Inglaterra vs Ghana 🇬🇭', result: 'GANA INGLATERRA' },
            { date: '23 Jun', match: '🇭🇷 Croacia vs Panamá 🇵🇦', result: 'GANA CROACIA' },
            { date: '27 Jun', match: '🇵🇦 Panamá vs Inglaterra 🏴', result: 'GANA INGLATERRA' },
            { date: '27 Jun', match: '🇭🇷 Croacia vs Ghana 🇬🇭', result: 'EMPATE' }
        ],
        classified: '🏴 Inglaterra | 🇭🇷 Croacia'
    },
    {
        id: 'summary',
        title: '🏆 RESUMEN DE CLASIFICADOS',
        type: 'summary',
        content: [
            ['Grupo', '1° Lugar', '2° Lugar'],
            ['A', '🇲🇽 México', '🇰🇷 Corea del Sur'],
            ['B', '🇨🇦 Canadá', '🇨🇭 Suiza'],
            ['C', '🇧🇷 Brasil', '🇲🇦 Marruecos'],
            ['D', '🇺🇸 USA', '🇮🇹 Italia'],
            ['E', '🇩🇪 Alemania', '🇪🇨 Ecuador'],
            ['F', '🇳🇱 Países Bajos', '🇸🇪 Suecia'],
            ['G', '🇧🇪 Bélgica', '🇪🇬 Egipto'],
            ['H', '🇪🇸 España', '🇺🇾 Uruguay'],
            ['I', '🇫🇷 Francia', '🇸🇳 Senegal'],
            ['J', '🇦🇷 ARGENTINA ⭐', '🇦🇹 Austria'],
            ['K', '🇵🇹 Portugal', '🇨🇴 Colombia'],
            ['L', '🏴 Inglaterra', '🇭🇷 Croacia']
        ]
    },
    {
        id: 'round_16',
        title: '⚡ CRUCES DE OCTAVOS (Proyección)',
        type: 'knockout',
        matches: [
            { match: '🇲🇽 México vs Suiza 🇨🇭', result: 'GANA MÉXICO' },
            { match: '🇨🇦 Canadá vs Corea del Sur 🇰🇷', result: 'GANA COREA DEL SUR' },
            { match: '🇧🇷 Brasil vs Marruecos 🇲🇦', result: 'GANA BRASIL' },
            { match: '🇺🇸 USA vs Italia 🇮🇹', result: 'GANA ITALIA' },
            { match: '🇩🇪 Alemania vs Ecuador 🇪🇨', result: 'GANA ALEMANIA' },
            { match: '🇳🇱 Países Bajos vs Suecia 🇸🇪', result: 'GANA PAÍSES BAJOS' },
            { match: '🇧🇪 Bélgica vs Egipto 🇪🇬', result: 'GANA BÉLGICA' },
            { match: '🇪🇸 España vs Uruguay 🇺🇾', result: 'GANA ESPAÑA' },
            { match: '🇫🇷 Francia vs Senegal 🇸🇳', result: 'GANA FRANCIA' },
            { match: '🇦🇷 ARGENTINA vs Colombia 🇨🇴', result: 'GANA ARGENTINA ⭐' },
            { match: '🇵🇹 Portugal vs Austria 🇦🇹', result: 'GANA PORTUGAL' },
            { match: '🏴 Inglaterra vs Croacia 🇭🇷', result: 'GANA INGLATERRA' }
        ]
    },
    {
        id: 'quarters',
        title: '⚡ CUARTOS DE FINAL',
        type: 'knockout',
        matches: [
            { match: '🇲🇽 México vs Italia 🇮🇹', result: 'GANA ITALIA' },
            { match: '🇧🇷 Brasil vs Corea del Sur 🇰🇷', result: 'GANA BRASIL' },
            { match: '🇩🇪 Alemania vs Bélgica 🇧🇪', result: 'GANA ALEMANIA' },
            { match: '🇳🇱 Países Bajos vs España 🇪🇸', result: 'GANA ESPAÑA' },
            { match: '🇫🇷 Francia vs ARGENTINA 🇦🇷', result: 'GANA ARGENTINA ⭐ (9 julio - fecha mágica)' },
            { match: '🇵🇹 Portugal vs Inglaterra 🏴', result: 'GANA INGLATERRA' }
        ]
    },
    {
        id: 'semis',
        title: '⚡ SEMIFINALES',
        type: 'knockout',
        matches: [
            { match: '🇮🇹 Italia vs Brasil 🇧🇷', result: 'GANA BRASIL' },
            { match: '🇩🇪 Alemania vs España 🇪🇸', result: 'GANA ESPAÑA' },
            { match: '🇦🇷 ARGENTINA vs Inglaterra 🏴', result: 'GANA ARGENTINA ⭐' }
        ]
    },
    {
        id: 'final',
        title: '🏆 FINAL - 19 DE JULIO 2026',
        type: 'highlight',
        match: '🇦🇷 ARGENTINA vs ESPAÑA 🇪🇸',
        result: 'GANA ARGENTINA ⭐⭐⭐',
        p: 'GANA ARGENTINA ⭐⭐⭐',
        notes: [
            'Factor astrológico:',
            'Júpiter todavía en Cáncer (17°)',
            '10 días después del 9 de julio (independencia)',
            'Energía máxima del ciclo'
        ]
    },
    {
        id: 'third_place',
        title: '🥉 TERCER PUESTO',
        type: 'highlight',
        match: '🇧🇷 Brasil vs Inglaterra 🏴',
        result: 'GANA BRASIL',
        notes: []
    }
];
