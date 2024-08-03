export const GRAMMER_RULES = [
    { pattern: ['NN', 'NN'], error: 1 }, // 동사 없이 명사만 있는 경우

    // 불완전한 문장
    { pattern: ['DT', 'NN', 'NN'], error: 1 }, // 불완전한 문장: 'DT NN NN' 패턴
    { pattern: ['DT', 'NN'], error: 1 }, // 불완전한 문장: 'DT NN' 패턴

    // 정상적인 문장 구조
    { pattern: ['NN', 'VB', 'NN'], error: 0 }, // 정상: 'NN VB NN' 패턴
    { pattern: ['DT', 'NN', 'VB'], error: 0 }, // 정상: 'DT NN VB' 패턴
    { pattern: ['DT', 'NN', 'VB', 'NN'], error: 0 }, // 정상: 'DT NN VB NN' 패턴

    // 동사 앞에 관사/명사가 있는 경우 오류
    { pattern: ['VB', 'DT', 'NN'], error: 1 }, // 동사 앞에 관사/명사가 있는 경우 오류
    { pattern: ['VB', 'NN', 'DT'], error: 1 }, // 동사 앞에 관사/명사가 있는 경우 오류

    // 명사 + 부사 + 동사 구조의 오류
    { pattern: ['NN', 'RB', 'VB'], error: 1 }, // 명사 + 부사 + 동사 구조의 오류
    { pattern: ['RB', 'NN', 'VB'], error: 1 }, // 부사 + 명사 + 동사 구조의 오류

    // 명사 + 동사 + 형용사 구조의 오류
    { pattern: ['NN', 'VB', 'JJ'], error: 1 }, // 명사 + 동사 + 형용사 구조의 오류
    { pattern: ['JJ', 'NN', 'VB'], error: 1 }, // 형용사 + 명사 + 동사 구조의 오류

    // 동사 + 형용사 패턴의 오류
    { pattern: ['VB', 'JJ'], error: 1 }, // 동사 + 형용사 구조의 오류 (문법적 오류 발생 가능성)
    { pattern: ['JJ', 'VB'], error: 1 }, // 형용사 + 동사 구조의 오류 (문법적 오류 발생 가능성)

    // 복잡한 패턴 오류
    { pattern: ['DT', 'NN', 'VB', 'RB'], error: 1 }, // 복잡한 구조 오류
    { pattern: ['NN', 'DT', 'VB'], error: 1 }, // 명사 + 관사 + 동사 구조의 오류
    { pattern: ['VB', 'NN', 'RB'], error: 1 }, // 동사 + 명사 + 부사 구조의 오류
    { pattern: ['NN', 'VB', 'NN', 'RB'], error: 1 }, // 명사 + 동사 + 명사 + 부사 구조의 오류
    { pattern: ['RB', 'DT', 'NN'], error: 1 }, // 부사 + 관사 + 명사 구조의 오류
    { pattern: ['DT', 'NN', 'VB', 'NN', 'RB'], error: 1 }, // 복잡한 구조 오류

    // 부정확한 형용사 및 부사의 사용
    { pattern: ['JJ', 'NN', 'RB'], error: 1 }, // 형용사 + 명사 + 부사 구조의 오류
    { pattern: ['RB', 'JJ', 'NN'], error: 1 }, // 부사 + 형용사 + 명사 구조의 오류

    // 특정 문법 오류
    { pattern: ['NN', 'NN', 'NN'], error: 1 }, // 명사만 반복되는 구조의 오류
    { pattern: ['VB', 'VB', 'NN'], error: 1 }, // 동사 + 동사 + 명사 구조의 오류
];

export const ADVANCED_WORDS = [
    'nevertheless',
    'consequently',
    'furthermore',
    'moreover',
    'however',
    'therefore',
    'nonetheless',
    'thus',
    'meanwhile',
    'subsequently',
    'alternatively',
    'hence',
    'likewise',
    'otherwise',
    'particularly',
    'notably',
    'additionally',
    'inasmuch',
    'whereas',
    'albeit',
    'conversely',
    'notwithstanding',
    'inasmuch',
    'ultimately',
    'preeminently',
    'predominantly',
    'generally',
    'remarkably',
    'ordinarily',
    'essentially',
    'comparatively',
    'significantly',
    'distinctively',
    'resolutely',
    'inevitably',
    'ultimately',
    'invariably',
    'fundamentally',
    'primarily',
    'emphatically',
    'indubitably',
    'unequivocally',
    'explicitly',
    'conclusively',
    'decisively',
    'exclusively',
    'superlatively',
    'inherently',
    'comparatively',
    'traditionally',
    'principally',
    'exemplarily',
    'notoriously',
    'quantitatively',
    'qualitatively',
    'preliminarily',
    'consequently',
    'essentially',
    'unambiguously',
    'significantly',
    'substantially',
    'largely',
    'predominantly',
    'principally',
    'ideally',
    'intrinsically',
    'explicitly',
    'historically',
    'theoretically',
    'empirically',
    'philosophically',
    'analytically',
    'operationally',
    'strategically'
];
