"use client";

// LIBS
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { FaPaintBrush, FaStar } from "react-icons/fa";
// import {type ClientUploadedFileData} from "uploadthing/types";
import { type ClientUploadedFileData } from "uploadthing/types";
// import { ClientUploadedFileData } from "";

// UTILS
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

// COMPONENTS
import { Separator } from "@radix-ui/react-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import LoadingSpinner from "~/components/ui/loading-spinner";
import { DivedToast } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import { UploadButton } from "~/components/uploadthing";

// COMP
const ProfPicChangeDialog = () => {
  const [mouseOver, setMouseOver] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: session, update: updateSession } = useSession();

  const { data: profilePictures, status: ppStatus } =
    api.profilePictures.getProfilePictures.useQuery();

  const editUser = api.user.edit.useMutation({
    onSuccess: async () => {
      await updateSession();
      setOpen(false);
      toast({
        action: <DivedToast type="success">{"Profile Pic Saved!"}</DivedToast>,
      });
    },
    onError: (error) => {
      toast({
        action: (
          <DivedToast type="error">{`Saving Profile Pic Failed: ${error.message}`}</DivedToast>
        ),
      });
    },
  });

  const addProfilePic = api.profilePictures.create.useMutation({
    onSuccess: async () => {
      await updateSession();
      setOpen(false);
      toast({
        action: <DivedToast type="success">{"Edit User Success"}</DivedToast>,
      });
    },
    onError: (error) => {
      toast({
        action: (
          <DivedToast type="error">{`Edit User Failed: ${error.message}`}</DivedToast>
        ),
      });
    },
  });

  const handleSetProfilePic = (url: string) => {
    editUser.mutate({ image: url });
  };

  const handleAddImage = (
    res: ClientUploadedFileData<{
      uploadedBy: string;
    }>[],
  ) => {
    if (res.length === 0) {
      toast({
        action: <DivedToast type="error">{`Image upload failed`}</DivedToast>,
      });
      return;
    }
    res.forEach((r) => {
      addProfilePic.mutate({ url: r.url });
    });
    if (res.length > 0 && res[0]?.url) handleSetProfilePic(res[0].url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          // IMAGE
          className="relative cursor-pointer rounded-md border-4 border-transparent hover:border-accent"
          onMouseEnter={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
        >
          <Image
            className="aspect-square h-full w-full overflow-hidden rounded-md object-cover text-xl font-semibold text-primary-foreground"
            src={session?.user?.image ? session.user.image : ""}
            width={130}
            height={130}
            alt={`${session?.user?.name}'s Profile Picture`}
            priority
          />
          <div
            className={cn(
              "absolute right-2 top-2 hidden items-center justify-center text-accent",
              mouseOver ? "flex" : "",
            )}
          >
            <FaPaintBrush className="ml-4 text-2xl" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Change Image</DialogHeader>
        <div className="flex flex-col items-center justify-center gap-10">
          <h3 className="text-lg font-semibold text-primary-foreground">
            Upload New Image
          </h3>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              console.log("Files: ", res);
              handleAddImage(res);
            }}
            onUploadError={(error: Error) => {
              toast({
                action: (
                  <DivedToast type="error">
                    {`Profile Picture upload failed! ${error.message}`}
                  </DivedToast>
                ),
              });
            }}
          />

          <Separator className="h-[1px] w-2/3 bg-popover-foreground/50" />

          {profilePictures && profilePictures?.length > 0 ? (
            <h3 className="text-lg font-semibold text-primary-foreground">
              Choose From Existing
            </h3>
          ) : null}
          <div className="flex items-center justify-around gap-8">
            {ppStatus === "pending" ? <LoadingSpinner /> : null}
            {profilePictures && profilePictures?.length > 0 ? (
              <div className="flex items-center justify-center gap-10">
                <div className="flex items-center justify-center gap-10">
                  {profilePictures.map((pp) => (
                    <div
                      key={pp.id}
                      className={cn(
                        "relative aspect-square cursor-pointer overflow-hidden rounded-sm",
                        pp.url === session?.user.image
                          ? "border-4 border-accent"
                          : "",
                      )}
                      onClick={() => handleSetProfilePic(pp.url)}
                    >
                      <Image
                        src={pp.url}
                        width={125}
                        height={125}
                        alt={`${session?.user?.name}'s Profile Picture`}
                        // fill
                        className="h-full w-full object-cover"
                      />
                      {pp.url === session?.user.image ? (
                        <div className="absolute left-1 top-1 text-2xl text-accent">
                          <FaStar />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ProfPicChangeDialog;
