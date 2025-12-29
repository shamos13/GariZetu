import {api} from "../lib/api";
import {Car, CarCreateRequest} from "../dashboard/admin/types/Car.ts";

export const carService = {
    // get all cars
    getAll: async (): Promise<Car[]> => {
        const res = await api.get("/cars/getcars");
        return res.data;
    },

    //create a new car
    createCar: async (payload: CarCreateRequest): Promise<Car> => {
        const res = await api.post("/cars/admin/create-car", payload);
        return res.data;
    }

    //updating an existing car
    updateCar: async (): Promise<Car> => {
        const res = await api.patch("/cars/admin")
    }
}