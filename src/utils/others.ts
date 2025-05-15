export const removePassword = (data: any) => {
    const { password: _, ...rest } = data;
    return rest;
};
