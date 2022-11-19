declare type ModifyPartial<T, R> = Partial<Omit<T, keyof R> & R>
declare type WithPartials<T, R> = T & Partial<Pick<T, R>>

declare global {
    interface Window {
        asdf: string;
    }
}

declare type SetState<T> = React.Dispatch<React.SetStateAction<T>>