import SectionsDetails from "@/components/sections/SectionsDetail";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Resource } from "@prisma/client";
import { redirect } from "next/navigation";

const SectionDetailsPage = async ({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) => {
  const { courseId, sectionId } = params;
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      sections: {
        where: {
          isPublished: true,
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  const section = await db.section.findUnique({
    where: {
      id: sectionId,
      courseId,
      isPublished: true,
    },
  });

  if (!section) {
    return redirect(`/courses/${courseId}/overview`);
  }


  let muxData = null;
  let resources: Resource[] = [];

  resources = await db.resource.findMany({
    where: {
      sectionId,
    },
  });

  if (section.isFree) {
    muxData = await db.muxData.findUnique({
      where: {
        sectionId,
      },
    });
  }


  return (
    <SectionsDetails
      course={course}
      section={section}
      muxData={muxData}
      resources={resources}
    />
  );
};

export default SectionDetailsPage;