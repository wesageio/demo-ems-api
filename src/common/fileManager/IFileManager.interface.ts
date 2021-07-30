export abstract class IFileManager {
    abstract insertFile(props: Array<any>): Promise<any[]>;
    abstract getFiles(props: Array<any>): Promise<any[]>;
}
