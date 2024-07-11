"use client"
import { Course } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast";
import axios from "axios";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title is required and must be at least 2 characters long",
    }),
})

const CreateSectionForm = ({ course }: { course: Course }) => {
    const pathname = usePathname();
    const router = useRouter();
    const routes = [
        { label: "Basic Information", path: `/instructor/courses/${course.id}/basic` },
        { label: "Curriculum", path: `/instructor/courses/${course.id}/sections` },
    ];

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) =>{
        try{
            const response = await axios.post(`/api/courses/${course.id}/sections`, values);
            router.push(`/instructor/courses/${course.id}/sections/${response.data.id}`)
            toast.success("New Section created!");
        } catch(err){
            toast.error("Something went wrong!");
            console.log("Failed to create a new section", err)
        }
    }

    return (
        <div className="px-10 py-6">
            <div className="flex gap-5">
                {routes.map((route) => (
                    <Link key={route.label} href={route.path} className="flex gap-4">
                        <Button variant={pathname === route.path ? "default" : "outline"}>{route.label}</Button>
                    </Link>
                ))}
            </div>
            <h1 className="text-xl font-bold mt-5">Add New Section</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Introduction" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-5">
                        <Link href={`/instructor/courses/${course.id}/basic`}>
                        <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                    <Button type="submit">Submit</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreateSectionForm