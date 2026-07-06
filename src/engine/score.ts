// engine/score.ts
export type Duration = 'w' | 'h' | 'q' | '8' | '16';
export type Note = { keys: string[]; duration: Duration }; // e.g. keys: ["c/4"]
export type Measure = { notes: Note[] };
export type Score = { measures: Measure[]; clef: 'treble' | 'bass' };

export var demoScore : Score = {
    measures: [
        {
            notes: [
                { keys: ['c/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['e/4'], duration: 'q' },
                { keys: ['f/4'], duration: 'q' }
            ]
        },
        {
            notes: [
                { keys: ['c/4'], duration: 'h' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['e/4'], duration: '8' },
                { keys: ['f/4'], duration: '8' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        }
    ],
    clef: 'treble'
};