import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.rendering.PDFRenderer;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

public class RenderPdf {
    public static void main(String[] args) throws Exception {
        File out = new File(args[1]);
        out.mkdirs();
        try (PDDocument doc = PDDocument.load(new File(args[0]))) {
            PDFRenderer r = new PDFRenderer(doc);
            for (int i = 0; i < doc.getNumberOfPages(); i++) {
                BufferedImage img = r.renderImageWithDPI(i, 200);
                ImageIO.write(img, "png", new File(out, "page" + (i + 1) + ".png"));
                System.out.println("page" + (i + 1) + " " + img.getWidth() + "x" + img.getHeight());
            }
        }
    }
}
