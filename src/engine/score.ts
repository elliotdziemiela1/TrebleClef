// engine/score.ts
export type Duration = 'w' | 'h' | 'q' | '8' | '16' | '32';
export type Note = { keys: string[]; duration: Duration, type?: string, color?: string }; // e.g. keys: ["c/4"], or, \
// type: "r" for rest, or, type : "s" for slash note
export type Measure = { notes: Note[] };
export type Score = { measures: Measure[]; clef: 'treble' | 'bass' };


export var emptyScore : Score = {
    measures: [
        { notes: [
                { keys: ['b/4'], duration: 'q', type: 'r' },
                { keys: ['b/4'], duration: 'q', type: 'r' },
                { keys: ['b/4'], duration: 'q', type: 'r', color: "blue"},
                { keys: ['b/4'], duration: 'q', type: 'r' }
        ] }
    ],
    clef: 'treble'
};

export var demoScore : Score = {
    measures: [
        {
            notes: [
                { keys: ['c/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['b/4'], duration: 'q', type: 'r' },
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
                { keys: ['c/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['e/4'], duration: '8' },
                { keys: ['f/4'], duration: '8' },
                { keys: ['e/4'], duration: '8' },
                { keys: ['f/4'], duration: '8' }
            ]
        },
        {
            notes: [
                { keys: ['b/4'], duration: 'w', type: 'r' }
            ]
        },
        {
            notes: [
                { keys: ['c/5'], duration: 'w' }
            ]
        },
        {
            notes: [
                { keys: ['b/4'], duration: '16', type: 'r' },
                { keys: ['b/4'], duration: '16', type: 'r' },
                { keys: ['b/4'], duration: '16', type: 'r' },
                { keys: ['b/4'], duration: '16', type: 'r' },
                { keys: ['b/4'], duration: '8', type: 'r' },
                { keys: ['b/4'], duration: '8', type: 'r' },
                { keys: ['b/4'], duration: 'h', type: 'r' },
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