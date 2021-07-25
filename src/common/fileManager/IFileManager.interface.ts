export abstract class IFileManager {
    abstract insertFile(props: Array<any>): Promise<any[]>;
}
