import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;

public class CropResize {
    public static void main(String[] args) throws Exception {
        File inDir = new File(args[0]);
        File outDir = new File(args[1]);
        outDir.mkdirs();
        String[][] items = {
                {"lion3.png", "animal_lion.png"},
                {"tiger.png", "animal_tiger.png"},
                {"monkey.png", "animal_monkey.png"},
                {"dog.png", "animal_dog.png"},
                {"cat.png", "animal_cat.png"},
                {"elephant.png", "animal_elephant.png"},
        };
        for (String[] it : items) {
            BufferedImage src = ImageIO.read(new File(inDir, it[0]));
            if (src == null) { System.out.println("skip " + it[0]); continue; }
            int w = src.getWidth(), h = src.getHeight();
            // drop bottom watermark strip (~12% of height), then center-crop square
            int cropH = (int) (h * 0.86);
            int side = Math.min(w, cropH);
            int x = (w - side) / 2, y = 0;
            BufferedImage sub = src.getSubimage(x, y, side, side);
            BufferedImage out = new BufferedImage(200, 200, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = out.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(sub, 0, 0, 200, 200, null);
            g.dispose();
            ImageIO.write(out, "png", new File(outDir, it[1]));
            System.out.println(it[1] + " from " + w + "x" + h);
        }
    }
}
