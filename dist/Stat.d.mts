export type FileDiff = {
    added: number;
    deleted: number;
    filename: string;
};
export type t = {
    files: FileDiff[];
    total: {
        added: number;
        deleted: number;
    };
};
export declare const Stat: t;
export declare const Log: ({ files, total: { added, deleted } }: t) => void;
