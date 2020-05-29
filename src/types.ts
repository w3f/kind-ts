export interface KindManager {
    start(name: string): Promise<void>;
    stop(name: string): Promise<void>;
    kubeconfig(name: string): Promise<string>;
}
