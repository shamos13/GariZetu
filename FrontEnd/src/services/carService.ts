import {api, BASE_URL} from "../lib/api";
import {Car} from "../dashboard/admin/types/Car.ts";
import axios from "axios";

export const carService = {
    // get all cars
    // this uses regular Api because its just fetching JSON
    getAll: async (): Promise<Car[]> => {
        const res = await api.get("/cars/getcars");
        return res.data;
    },


    /**
     * Create a new car with image upload
     *
     * IMPORTANT: This does NOT use the `api` instance!
     *
     * Why? Because:
     * 1. The `api` instance has "Content-Type: application/json" as default header
     * 2. For multipart/form-data, we need a DIFFERENT Content-Type
     * 3. Axios automatically sets the correct multipart Content-Type when we pass FormData
     *
     * @param formData - FormData object containing car fields + image file
     * @returns The created car with mainImageUrl populated
     */
    createCar: async (formData: FormData): Promise<Car> => {
        const res = await axios.post(`${BASE_URL}/api/v1/cars/admin/create-car`,
            formData,
        {
            headers: {'Content-Type': 'multipart/form-data'
            }
        }
        );
        return res.data;
    }

}