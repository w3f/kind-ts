export interface KindManager {
    start(name: string): Promise<string | number>;
    stop(name: string): Promise<string | number>;
    kubeconfig(name: string): Promise<string | number>;
}
