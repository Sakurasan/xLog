import { Profile } from "~/lib/types"
import { useAccountSites } from "~/queries/site"
import { Avatar } from "~/components/ui/Avatar"
import { Input } from "~/components/ui/Input"
import { Button } from "~/components/ui/Button"
import { useForm } from "react-hook-form"
import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { useState, useEffect } from "react"
import { useCommentPage } from "~/queries/page"
import { useRouter } from "next/router"
import { EmojiPicker } from "./EmojiPicker"
import { Popover } from "@headlessui/react"
import { FaceSmileIcon } from "@heroicons/react/24/outline"

export const CommentInput: React.FC<{
  pageId?: string
  originalId?: string
}> = ({ pageId, originalId }) => {
  const account = useAccountState((s) => s.computed.account)
  const userSites = useAccountSites()
  const { show: openConnectModal } = useConnectModal()
  const commentPage = useCommentPage()
  const router = useRouter()
  const [viewer, setViewer] = useState<Profile | null>(null)

  useEffect(() => {
    if (userSites.isSuccess && userSites.data?.length) {
      setViewer(userSites.data[0])
    }
  }, [userSites, router])

  const form = useForm({
    defaultValues: {
      content: "",
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!account) {
      openConnectModal?.()
    } else if (userSites.isSuccess && !userSites.data?.length) {
      router.push(`/dashboard/new-site`)
    } else if (pageId) {
      commentPage.mutate({
        pageId: pageId,
        content: values.content,
        externalUrl: window.location.href,
        originalId: originalId,
      })
    }
  })

  useEffect(() => {
    if (commentPage.isSuccess) {
      form.reset()
    }
  }, [commentPage.isSuccess, form])

  return (
    <div className="xlog-comment-input flex">
      <Avatar
        className="align-middle mr-3"
        images={viewer?.avatars || []}
        name={viewer?.name}
        size={45}
      />
      <form className="w-full" onSubmit={handleSubmit}>
        <div>
          <Input
            id="content"
            isBlock
            required={
              !!account && userSites.isSuccess && !!userSites.data?.length
            }
            disabled={
              !account || !userSites.isSuccess || !userSites.data?.length
            }
            multiline
            maxLength={300}
            className="mb-2"
            placeholder="Write a comment on the blockchain"
            {...form.register("content", {})}
          />
        </div>
        <div className="flex justify-between">
          <Popover className="relative flex justify-center">
            {({ open }: { open: boolean }) => (
              <>
                <Popover.Button className="group inline-flex items-center rounded-md px-2 text-xl">
                  <FaceSmileIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-500" />
                </Popover.Button>
                <Popover.Panel className="absolute left-0 top-full z-10">
                  <EmojiPicker
                    onEmojiSelect={(e: any) =>
                      form.setValue(
                        "content",
                        form.getValues("content") + e.native,
                      )
                    }
                  />
                </Popover.Panel>
              </>
            )}
          </Popover>
          <Button
            type="submit"
            isLoading={userSites.isLoading || commentPage.isLoading}
          >
            {account
              ? userSites.isSuccess && !userSites.data?.length
                ? "Create Character"
                : "Submit"
              : "Connect"}
          </Button>
        </div>
      </form>
    </div>
  )
}
