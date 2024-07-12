"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Course, MuxData, Resource, Section } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormDescription,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import RichEditor from "@/components/custom/RichEditor"
import { Switch } from "@/components/ui/switch"
import FileUpload from "../custom/FileUpload"
import Link from "next/link"
import axios from "axios"
import { usePathname, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ArrowLeft, Trash } from "lucide-react"
import ResourceForm from "./ResourceForm"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title is required and must be at least 2 characters long"
    }),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: z.boolean().optional(),
})

interface EditSectionFormProps {
    section: Section & { resources: Resource[], muxData?: MuxData | null },
    courseId: string,
    isCompleted: boolean
}


const EditSectionForm = ({ section, courseId, isCompleted }: EditSectionFormProps) => {
    const router = useRouter();
    const pathname = usePathname();
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: section.title || "",
            description: section.description || "",
            videoUrl: section.videoUrl || "",
            isFree: section.isFree,
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await axios.patch(`/api/courses/${courseId}`, values)
            toast.success("Course Updated")
            router.refresh()
        } catch (err) {
            console.log("Failed to update the course", err)
            toast.error("Something went wrong!")
        }
    };

    return (
        <>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-7">
                <Link href={`/instructor/courses/${courseId}/sections`}>
                    <Button variant="outline" className="text-sm font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to curriculum
                    </Button>
                </Link>

                <div className="flex gap-4 items-start">
                    <Button variant="outline">Publish</Button>
                    <Button><Trash className="h-4 w-4" /></Button>
                </div>
            </div>
            <h1 className="text-xl font-bold">Edit Section</h1>
            <p className="text-sm font-medium mt-2">
                Complete this section with detailed information, good video and resources to give your students the best learning experience
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Introduction to Web Development" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <RichEditor placeholder="What is this section about?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Video</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        value={field.value || ""}
                                        onChange={(url) => field.onChange(url)}
                                        endpoint="sectionVideo"
                                        page="Edit Section"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>
                                        Accessibility
                                    </FormLabel>
                                    <FormDescription>
                                        Everyone can access this section for FREE
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-5">
                        <Link href={`/instructor/courses/${courseId}/sections`}>
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Form>
            <ResourceForm section={section} courseId={courseId}/>
        </>
    );
};

export default EditSectionForm