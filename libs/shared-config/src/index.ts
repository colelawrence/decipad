interface ReplicateModel {
  label: string;
  description: string;
  model: string;
  outputs: number;
  tokenPrice: number;
  settings: (prompt: string) => object;
}

export const ReplicateModels: ReplicateModel[] = [
  {
    label: 'Image',
    outputs: 4,
    tokenPrice: 10_000,
    description:
      'Generate an image with AI. Try to be explicit about what you want and tell the style you want, etc...',
    model:
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    settings: (prompt: string): object => ({
      width: 768,
      height: 768,
      prompt,
      refine: 'expert_ensemble_refiner',
      scheduler: 'K_EULER',
      lora_scale: 0.6,
      num_outputs: 4,
      guidance_scale: 7.5,
      apply_watermark: false,
      high_noise_frac: 0.8,
      negative_prompt: '',
      prompt_strength: 0.8,
      num_inference_steps: 25,
    }),
  },
  {
    label: 'Sticker',
    outputs: 2,
    tokenPrice: 10_000,
    description:
      'Make stickers with AI. Generates graphics with transparent backgrounds.',
    model:
      'fofr/sticker-maker:58a7099052ed9928ee6a65559caa790bfa8909841261ef588686660189eb9dc8',
    settings: (prompt: string): object => ({
      steps: 20,
      width: 1024,
      height: 1024,
      prompt: prompt,
      upscale: true,
      upscale_steps: 10,
      negative_prompt: '',
    }),
  },
];
