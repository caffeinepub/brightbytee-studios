import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  BlockedBuyer,
  PolicyDocument,
  Review,
  Template,
} from "../backend";
import { useActor } from "./useActor";

export type { Review };

export function useTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTemplates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFreeTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery<Template[]>({
    queryKey: ["freeTemplates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFreeTemplates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: bigint;
      isFree: boolean;
      previewImageBlobId: string;
      templateFileBlobId: string;
      features: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTemplate(
        data.name,
        data.description,
        data.price,
        data.isFree,
        data.previewImageBlobId,
        data.templateFileBlobId,
        data.features,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["freeTemplates"] });
    },
  });
}

export function useUpdateTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      isFree: boolean;
      features: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTemplate(
        data.id,
        data.name,
        data.description,
        data.price,
        data.isFree,
        data.features,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["freeTemplates"] });
    },
  });
}

export function useDeleteTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTemplate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["freeTemplates"] });
    },
  });
}

export function useAddAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      isPublished: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addAnnouncement(data.title, data.content, data.isPublished);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Announcement) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      templateId: bigint;
      transactionRef: string;
      buyerName: string;
      buyerEmail: string;
      buyerAddress: string;
      businessDetails: string;
      accountRecoveryConfirm: boolean;
      templateUseCase: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordPayment(
        data.templateId,
        data.transactionRef,
        data.buyerName,
        data.buyerEmail,
        data.buyerAddress,
        data.businessDetails,
        data.accountRecoveryConfirm,
        data.templateUseCase,
      );
    },
  });
}

export function useGetTemplateFileId() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      templateId: bigint;
      transactionRef: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.getTemplateFileId(data.templateId, data.transactionRef);
    },
  });
}

export function useReviews(templateId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", templateId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews(templateId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      templateId: bigint;
      reviewerName: string;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addReview(
        data.templateId,
        data.reviewerName,
        data.rating,
        data.comment,
      );
    },
    onSuccess: (
      _result: bigint,
      variables: {
        templateId: bigint;
        reviewerName: string;
        rating: bigint;
        comment: string;
      },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.templateId.toString()],
      });
    },
  });
}

export function useGetPolicyDocuments() {
  const { actor, isFetching } = useActor();
  return useQuery<PolicyDocument[]>({
    queryKey: ["policyDocuments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPolicyDocuments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPolicyDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      docType: string;
      fileName: string;
      blobId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPolicyDocument(data.docType, data.fileName, data.blobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policyDocuments"] });
    },
  });
}

export function useDeletePolicyDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePolicyDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policyDocuments"] });
    },
  });
}

export function useGetBlockedBuyers() {
  const { actor, isFetching } = useActor();
  return useQuery<BlockedBuyer[]>({
    queryKey: ["blockedBuyers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBlockedBuyers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBlockBuyer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; reason: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.blockBuyer(data.email, data.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedBuyers"] });
    },
  });
}

export function useUnblockBuyer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.unblockBuyer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedBuyers"] });
    },
  });
}

export function useIsEmailBlocked() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("No actor");
      return actor.isEmailBlocked(email);
    },
  });
}

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["allReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
