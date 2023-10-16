exports.cleanMarkdown = async (markdown) => {
  const { remark } = await import('remark');
  const strip = await import('strip-markdown');
  return (await remark().use(strip, { table: strip.use }).process(markdown))
    .value;
};
